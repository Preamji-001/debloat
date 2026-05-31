package handlers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/preamjigk/debloat/internal/models"
)

type MealsHandler struct {
	DB *pgxpool.Pool
}

func (h *MealsHandler) List(c *gin.Context) {
	query := `SELECT id, name, description, category, kcal, protein_g, carbs_g, fat_g, price_paise, image_url, is_available FROM meals WHERE 1=1`
	args := []any{}
	i := 1

	if cat := c.Query("category"); cat != "" {
		query += ` AND category=$` + itoa(i)
		args = append(args, cat)
		i++
	}
	if v := c.Query("kcal_max"); v != "" {
		query += ` AND kcal<=$` + itoa(i)
		args = append(args, v)
		i++
	}
	if v := c.Query("protein_min"); v != "" {
		query += ` AND protein_g>=$` + itoa(i)
		args = append(args, v)
		i++
	}
	if v := c.Query("carbs_max"); v != "" {
		query += ` AND carbs_g<=$` + itoa(i)
		args = append(args, v)
		i++
	}
	if v := c.Query("fat_max"); v != "" {
		query += ` AND fat_g<=$` + itoa(i)
		args = append(args, v)
		i++
	}
	_ = i

	rows, err := h.DB.Query(context.Background(), query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": err.Error()}})
		return
	}
	defer rows.Close()

	meals := []models.Meal{}
	for rows.Next() {
		var m models.Meal
		if err := rows.Scan(&m.ID, &m.Name, &m.Description, &m.Category, &m.Kcal, &m.ProteinG, &m.CarbsG, &m.FatG, &m.PricePaise, &m.ImageURL, &m.IsAvailable); err != nil {
			continue
		}
		meals = append(meals, m)
	}
	c.JSON(http.StatusOK, gin.H{"data": meals})
}

func (h *MealsHandler) Get(c *gin.Context) {
	var m models.Meal
	err := h.DB.QueryRow(context.Background(),
		`SELECT id, name, description, category, kcal, protein_g, carbs_g, fat_g, price_paise, image_url, is_available FROM meals WHERE id=$1`,
		c.Param("id"),
	).Scan(&m.ID, &m.Name, &m.Description, &m.Category, &m.Kcal, &m.ProteinG, &m.CarbsG, &m.FatG, &m.PricePaise, &m.ImageURL, &m.IsAvailable)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "NOT_FOUND", "message": "meal not found"}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": m})
}

func itoa(i int) string {
	return strconv.Itoa(i)
}
