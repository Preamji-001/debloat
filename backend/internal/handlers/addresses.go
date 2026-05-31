package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/preamjigk/debloat/internal/models"
)

type AddressesHandler struct {
	DB *pgxpool.Pool
}

func (h *AddressesHandler) List(c *gin.Context) {
	userID, _ := c.Get("userID")
	rows, err := h.DB.Query(context.Background(),
		`SELECT id, label, line1, city, pincode, is_default FROM addresses WHERE user_id=$1 ORDER BY is_default DESC`, userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": err.Error()}})
		return
	}
	defer rows.Close()

	addrs := []models.Address{}
	for rows.Next() {
		var a models.Address
		if err := rows.Scan(&a.ID, &a.Label, &a.Line1, &a.City, &a.Pincode, &a.IsDefault); err != nil {
			continue
		}
		addrs = append(addrs, a)
	}
	c.JSON(http.StatusOK, gin.H{"data": addrs})
}

func (h *AddressesHandler) Create(c *gin.Context) {
	userID, _ := c.Get("userID")
	var body struct {
		Label   *string `json:"label"`
		Line1   string  `json:"line1" binding:"required"`
		City    string  `json:"city" binding:"required"`
		Pincode string  `json:"pincode" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_INPUT", "message": err.Error()}})
		return
	}

	id := uuid.NewString()
	var a models.Address
	err := h.DB.QueryRow(context.Background(),
		`INSERT INTO addresses (id, user_id, label, line1, city, pincode) VALUES ($1,$2,$3,$4,$5,$6)
		RETURNING id, label, line1, city, pincode, is_default`,
		id, userID, body.Label, body.Line1, body.City, body.Pincode,
	).Scan(&a.ID, &a.Label, &a.Line1, &a.City, &a.Pincode, &a.IsDefault)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "DB_ERROR", "message": err.Error()}})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": a})
}
