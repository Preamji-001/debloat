package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/preamjigk/debloat/internal/models"
)

type AdminHandler struct {
	DB *pgxpool.Pool
}

func (h *AdminHandler) ListOrders(c *gin.Context) {
	query := `SELECT o.id, o.status, o.total_paise, o.created_at,
		ds.id, ds.date::text, ds.label, ds.capacity, ds.booked_count, ds.is_active
	FROM orders o JOIN delivery_slots ds ON ds.id=o.slot_id WHERE 1=1`
	args := []any{}
	i := 1

	if date := c.Query("date"); date != "" {
		query += ` AND ds.date=$` + itoa(i)
		args = append(args, date)
		i++
	}
	if status := c.Query("status"); status != "" {
		query += ` AND o.status=$` + itoa(i)
		args = append(args, status)
		i++
	}
	_ = i
	query += ` ORDER BY o.created_at DESC`

	rows, err := h.DB.Query(context.Background(), query, args...)
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

func (h *AdminHandler) UpdateOrderStatus(c *gin.Context) {
	var body struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_INPUT", "message": err.Error()}})
		return
	}

	var o models.Order
	err := h.DB.QueryRow(context.Background(),
		`UPDATE orders SET status=$1 WHERE id=$2 RETURNING id, status, total_paise, created_at`,
		body.Status, c.Param("id"),
	).Scan(&o.ID, &o.Status, &o.TotalPaise, &o.CreatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "NOT_FOUND", "message": "order not found"}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": o})
}

func (h *AdminHandler) SetMealAvailability(c *gin.Context) {
	var body struct {
		IsAvailable bool `json:"is_available"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_INPUT", "message": err.Error()}})
		return
	}

	var m models.Meal
	err := h.DB.QueryRow(context.Background(),
		`UPDATE meals SET is_available=$1 WHERE id=$2
		RETURNING id, name, description, category, kcal, protein_g, carbs_g, fat_g, price_paise, image_url, is_available`,
		body.IsAvailable, c.Param("id"),
	).Scan(&m.ID, &m.Name, &m.Description, &m.Category, &m.Kcal, &m.ProteinG, &m.CarbsG, &m.FatG, &m.PricePaise, &m.ImageURL, &m.IsAvailable)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "NOT_FOUND", "message": "meal not found"}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": m})
}
