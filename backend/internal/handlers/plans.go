package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/preamjigk/debloat/internal/models"
)

type PlansHandler struct {
	DB *pgxpool.Pool
}

func (h *PlansHandler) List(c *gin.Context) {
	rows, err := h.DB.Query(context.Background(),
		`SELECT id, name, description, meal_count, price_paise, discount_pct, is_active FROM meal_plans WHERE is_active=true`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": err.Error()}})
		return
	}
	defer rows.Close()

	plans := []models.MealPlan{}
	for rows.Next() {
		var p models.MealPlan
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.MealCount, &p.PricePaise, &p.DiscountPct, &p.IsActive); err != nil {
			continue
		}
		plans = append(plans, p)
	}
	c.JSON(http.StatusOK, gin.H{"data": plans})
}

func (h *PlansHandler) Get(c *gin.Context) {
	var p models.MealPlan
	err := h.DB.QueryRow(context.Background(),
		`SELECT id, name, description, meal_count, price_paise, discount_pct, is_active FROM meal_plans WHERE id=$1`,
		c.Param("id"),
	).Scan(&p.ID, &p.Name, &p.Description, &p.MealCount, &p.PricePaise, &p.DiscountPct, &p.IsActive)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "NOT_FOUND", "message": "plan not found"}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": p})
}
