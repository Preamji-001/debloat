package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/preamjigk/debloat/internal/models"
)

type CartHandler struct {
	DB *pgxpool.Pool
}

func (h *CartHandler) Get(c *gin.Context) {
	userID, _ := c.Get("userID")
	rows, err := h.DB.Query(context.Background(),
		`SELECT ci.id, ci.meal_id, ci.quantity,
			m.id, m.name, m.description, m.category, m.kcal, m.protein_g, m.carbs_g, m.fat_g, m.price_paise, m.image_url, m.is_available
		FROM cart_items ci JOIN meals m ON m.id=ci.meal_id WHERE ci.user_id=$1`, userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": err.Error()}})
		return
	}
	defer rows.Close()

	items := []models.CartItem{}
	for rows.Next() {
		var ci models.CartItem
		var m models.Meal
		if err := rows.Scan(&ci.ID, &ci.MealID, &ci.Qty,
			&m.ID, &m.Name, &m.Description, &m.Category, &m.Kcal, &m.ProteinG, &m.CarbsG, &m.FatG, &m.PricePaise, &m.ImageURL, &m.IsAvailable,
		); err != nil {
			continue
		}
		ci.Meal = &m
		items = append(items, ci)
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}

func (h *CartHandler) Add(c *gin.Context) {
	userID, _ := c.Get("userID")
	var body struct {
		MealID   string `json:"meal_id" binding:"required"`
		Quantity int    `json:"quantity" binding:"required,min=1"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_INPUT", "message": err.Error()}})
		return
	}

	var existingID string
	err := h.DB.QueryRow(context.Background(),
		`SELECT id FROM cart_items WHERE user_id=$1 AND meal_id=$2`, userID, body.MealID,
	).Scan(&existingID)

	if err == nil {
		// upsert — increment
		var ci models.CartItem
		var m models.Meal
		h.DB.QueryRow(context.Background(),
			`UPDATE cart_items SET quantity=quantity+$1 WHERE id=$2
			RETURNING id, meal_id, quantity`,
			body.Quantity, existingID,
		).Scan(&ci.ID, &ci.MealID, &ci.Qty)
		h.DB.QueryRow(context.Background(),
			`SELECT id, name, description, category, kcal, protein_g, carbs_g, fat_g, price_paise, image_url, is_available FROM meals WHERE id=$1`, ci.MealID,
		).Scan(&m.ID, &m.Name, &m.Description, &m.Category, &m.Kcal, &m.ProteinG, &m.CarbsG, &m.FatG, &m.PricePaise, &m.ImageURL, &m.IsAvailable)
		ci.Meal = &m
		c.JSON(http.StatusOK, gin.H{"data": ci})
		return
	}

	id := uuid.NewString()
	var ci models.CartItem
	var m models.Meal
	h.DB.QueryRow(context.Background(),
		`INSERT INTO cart_items (id, user_id, meal_id, quantity) VALUES ($1,$2,$3,$4) RETURNING id, meal_id, quantity`,
		id, userID, body.MealID, body.Quantity,
	).Scan(&ci.ID, &ci.MealID, &ci.Qty)
	h.DB.QueryRow(context.Background(),
		`SELECT id, name, description, category, kcal, protein_g, carbs_g, fat_g, price_paise, image_url, is_available FROM meals WHERE id=$1`, ci.MealID,
	).Scan(&m.ID, &m.Name, &m.Description, &m.Category, &m.Kcal, &m.ProteinG, &m.CarbsG, &m.FatG, &m.PricePaise, &m.ImageURL, &m.IsAvailable)
	ci.Meal = &m
	c.JSON(http.StatusCreated, gin.H{"data": ci})
}

func (h *CartHandler) Update(c *gin.Context) {
	userID, _ := c.Get("userID")
	var body struct {
		Quantity int `json:"quantity" binding:"required,min=1"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_INPUT", "message": err.Error()}})
		return
	}

	var ci models.CartItem
	err := h.DB.QueryRow(context.Background(),
		`UPDATE cart_items SET quantity=$1 WHERE id=$2 AND user_id=$3 RETURNING id, meal_id, quantity`,
		body.Quantity, c.Param("id"), userID,
	).Scan(&ci.ID, &ci.MealID, &ci.Qty)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "NOT_FOUND", "message": "cart item not found"}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": ci})
}

func (h *CartHandler) Remove(c *gin.Context) {
	userID, _ := c.Get("userID")
	_, err := h.DB.Exec(context.Background(),
		`DELETE FROM cart_items WHERE id=$1 AND user_id=$2`, c.Param("id"), userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": err.Error()}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "removed"}})
}

func (h *CartHandler) Clear(c *gin.Context) {
	userID, _ := c.Get("userID")
	h.DB.Exec(context.Background(), `DELETE FROM cart_items WHERE user_id=$1`, userID)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "cleared"}})
}
