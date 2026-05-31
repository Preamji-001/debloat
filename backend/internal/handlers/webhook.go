package handlers

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type WebhookHandler struct {
	DB             *pgxpool.Pool
	RazorpaySecret string
}

func (h *WebhookHandler) Razorpay(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "BAD_REQUEST", "message": "cannot read body"}})
		return
	}

	sig := c.GetHeader("X-Razorpay-Signature")
	if !verifyRazorpaySignature(body, sig, h.RazorpaySecret) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": gin.H{"code": "INVALID_SIGNATURE", "message": "signature mismatch"}})
		return
	}

	var payload struct {
		Event string `json:"event"`
		Payload struct {
			Payment struct {
				Entity struct {
					OrderID string `json:"order_id"`
				} `json:"entity"`
			} `json:"payment"`
		} `json:"payload"`
	}
	if err := json.Unmarshal(body, &payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_PAYLOAD", "message": "cannot parse payload"}})
		return
	}

	rzpOrderID := payload.Payload.Payment.Entity.OrderID
	switch payload.Event {
	case "payment.captured":
		h.DB.Exec(context.Background(),
			`UPDATE orders SET status='confirmed' WHERE razorpay_order_id=$1`, rzpOrderID,
		)
	case "payment.failed":
		h.DB.Exec(context.Background(),
			`UPDATE orders SET status='cancelled' WHERE razorpay_order_id=$1`, rzpOrderID,
		)
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{"received": true}})
}

func verifyRazorpaySignature(body []byte, sig, secret string) bool {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(sig))
}
