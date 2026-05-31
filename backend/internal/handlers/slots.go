package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/preamjigk/debloat/internal/models"
)

type SlotsHandler struct {
	DB *pgxpool.Pool
}

func (h *SlotsHandler) List(c *gin.Context) {
	date := c.Query("date")
	if date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_INPUT", "message": "date query param required"}})
		return
	}

	rows, err := h.DB.Query(context.Background(),
		`SELECT id, date::text, label, capacity, booked_count, is_active FROM delivery_slots WHERE date=$1 AND is_active=true ORDER BY label`,
		date,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": err.Error()}})
		return
	}
	defer rows.Close()

	slots := []models.DeliverySlot{}
	for rows.Next() {
		var s models.DeliverySlot
		if err := rows.Scan(&s.ID, &s.Date, &s.Label, &s.Capacity, &s.BookedCount, &s.IsActive); err != nil {
			continue
		}
		slots = append(slots, s)
	}
	c.JSON(http.StatusOK, gin.H{"data": slots})
}
