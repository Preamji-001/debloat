package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/preamjigk/debloat/internal/models"
)

type OrdersHandler struct {
	DB             *pgxpool.Pool
	RazorpayKeyID  string
	RazorpaySecret string
}

func (h *OrdersHandler) Create(c *gin.Context) {
	userID, _ := c.Get("userID")
	var body struct {
		AddressID string `json:"address_id" binding:"required"`
		SlotID    string `json:"delivery_slot_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_INPUT", "message": err.Error()}})
		return
	}

	// Validate address belongs to user
	var addrCheck string
	if err := h.DB.QueryRow(context.Background(),
		`SELECT id FROM addresses WHERE id=$1 AND user_id=$2`, body.AddressID, userID,
	).Scan(&addrCheck); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_ADDRESS", "message": "address not found"}})
		return
	}

	// Validate slot has capacity
	var slot models.DeliverySlot
	if err := h.DB.QueryRow(context.Background(),
		`SELECT id, date::text, label, capacity, booked_count, is_active FROM delivery_slots WHERE id=$1`,
		body.SlotID,
	).Scan(&slot.ID, &slot.Date, &slot.Label, &slot.Capacity, &slot.BookedCount, &slot.IsActive); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_SLOT", "message": "slot not found"}})
		return
	}
	if slot.BookedCount >= slot.Capacity {
		c.JSON(http.StatusConflict, gin.H{"error": gin.H{"code": "SLOT_FULL", "message": "slot is full"}})
		return
	}

	// Fetch cart items
	rows, err := h.DB.Query(context.Background(),
		`SELECT ci.id, ci.meal_id, ci.quantity, m.name, m.price_paise
		FROM cart_items ci JOIN meals m ON m.id=ci.meal_id WHERE ci.user_id=$1`, userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": err.Error()}})
		return
	}
	defer rows.Close()

	type cartRow struct {
		ID         string
		MealID     string
		Qty        int
		MealName   string
		PricePaise int
	}
	var cartItems []cartRow
	totalPaise := 0
	for rows.Next() {
		var r cartRow
		rows.Scan(&r.ID, &r.MealID, &r.Qty, &r.MealName, &r.PricePaise)
		cartItems = append(cartItems, r)
		totalPaise += r.PricePaise * r.Qty
	}
	if len(cartItems) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "EMPTY_CART", "message": "cart is empty"}})
		return
	}

	// Create Razorpay order
	orderID := uuid.NewString()
	rzpOrderID, err := h.createRazorpayOrder(orderID, totalPaise)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "PAYMENT_ERROR", "message": err.Error()}})
		return
	}

	// Insert order
	_, err = h.DB.Exec(context.Background(),
		`INSERT INTO orders (id, user_id, address_id, slot_id, status, total_paise, razorpay_order_id) VALUES ($1,$2,$3,$4,'confirmed',$5,$6)`,
		orderID, userID, body.AddressID, body.SlotID, totalPaise, rzpOrderID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": err.Error()}})
		return
	}

	// Insert order items
	for _, item := range cartItems {
		h.DB.Exec(context.Background(),
			`INSERT INTO order_items (id, order_id, meal_id, meal_name, quantity, price_paise) VALUES ($1,$2,$3,$4,$5,$6)`,
			uuid.NewString(), orderID, item.MealID, item.MealName, item.Qty, item.PricePaise,
		)
	}

	// Increment slot booked_count
	h.DB.Exec(context.Background(),
		`UPDATE delivery_slots SET booked_count=booked_count+1 WHERE id=$1`, body.SlotID,
	)

	c.JSON(http.StatusCreated, gin.H{"data": gin.H{
		"id":                orderID,
		"razorpay_order_id": rzpOrderID,
		"amount":            totalPaise,
		"key_id":            h.RazorpayKeyID,
	}})
}

func (h *OrdersHandler) createRazorpayOrder(receipt string, amount int) (string, error) {
	body, _ := json.Marshal(map[string]any{
		"amount":   amount,
		"currency": "INR",
		"receipt":  receipt,
	})
	req, _ := http.NewRequest("POST", "https://api.razorpay.com/v1/orders", bytes.NewReader(body))
	req.SetBasicAuth(h.RazorpayKeyID, h.RazorpaySecret)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result map[string]any
	json.NewDecoder(resp.Body).Decode(&result)
	if id, ok := result["id"].(string); ok {
		return id, nil
	}
	return "", fmt.Errorf("razorpay order creation failed")
}

func (h *OrdersHandler) List(c *gin.Context) {
	userID, _ := c.Get("userID")
	rows, err := h.DB.Query(context.Background(),
		`SELECT o.id, o.status, o.total_paise, o.created_at,
			ds.id, ds.date::text, ds.label, ds.capacity, ds.booked_count, ds.is_active
		FROM orders o JOIN delivery_slots ds ON ds.id=o.slot_id
		WHERE o.user_id=$1 ORDER BY o.created_at DESC`, userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": err.Error()}})
		return
	}
	defer rows.Close()

	orders := []models.Order{}
	for rows.Next() {
		var o models.Order
		var ds models.DeliverySlot
		rows.Scan(&o.ID, &o.Status, &o.TotalPaise, &o.CreatedAt,
			&ds.ID, &ds.Date, &ds.Label, &ds.Capacity, &ds.BookedCount, &ds.IsActive)
		o.DeliverySlot = &ds
		orders = append(orders, o)
	}
	c.JSON(http.StatusOK, gin.H{"data": orders})
}

func (h *OrdersHandler) Get(c *gin.Context) {
	userID, _ := c.Get("userID")
	var o models.Order
	var ds models.DeliverySlot
	err := h.DB.QueryRow(context.Background(),
		`SELECT o.id, o.status, o.total_paise, o.created_at,
			ds.id, ds.date::text, ds.label, ds.capacity, ds.booked_count, ds.is_active
		FROM orders o JOIN delivery_slots ds ON ds.id=o.slot_id
		WHERE o.id=$1 AND o.user_id=$2`, c.Param("id"), userID,
	).Scan(&o.ID, &o.Status, &o.TotalPaise, &o.CreatedAt,
		&ds.ID, &ds.Date, &ds.Label, &ds.Capacity, &ds.BookedCount, &ds.IsActive)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "NOT_FOUND", "message": "order not found"}})
		return
	}
	o.DeliverySlot = &ds

	rows, _ := h.DB.Query(context.Background(),
		`SELECT id, meal_id, meal_name, quantity, price_paise FROM order_items WHERE order_id=$1`, o.ID,
	)
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var item models.OrderItem
			rows.Scan(&item.ID, &item.MealID, &item.MealName, &item.Quantity, &item.PricePaise)
			o.Items = append(o.Items, item)
		}
	}
	c.JSON(http.StatusOK, gin.H{"data": o})
}
