package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	DB     *pgxpool.Pool
	Secret string
}

func (h *AuthHandler) issueTokens(c *gin.Context, userID, role string) {
	now := time.Now()

	access := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  userID,
		"role": role,
		"exp":  now.Add(15 * time.Minute).Unix(),
	})
	accessStr, _ := access.SignedString([]byte(h.Secret))

	refresh := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  userID,
		"role": role,
		"exp":  now.Add(7 * 24 * time.Hour).Unix(),
	})
	refreshStr, _ := refresh.SignedString([]byte(h.Secret))

	secure := c.Request.TLS != nil
	c.SetCookie("access_token", accessStr, 15*60, "/", "", secure, true)
	c.SetCookie("refresh_token", refreshStr, 7*24*3600, "/", "", secure, true)
}

func (h *AuthHandler) Register(c *gin.Context) {
	var body struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required"`
		Phone    string `json:"phone" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_INPUT", "message": err.Error()}})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"code": "SERVER_ERROR", "message": "could not hash password"}})
		return
	}

	id := uuid.NewString()
	_, err = h.DB.Exec(context.Background(),
		`INSERT INTO users (id, name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,$5,'customer')`,
		id, body.Name, body.Email, body.Phone, string(hash),
	)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": gin.H{"code": "EMAIL_EXISTS", "message": "email already registered"}})
		return
	}

	h.issueTokens(c, id, "customer")
	c.JSON(http.StatusCreated, gin.H{"data": gin.H{"id": id, "name": body.Name, "email": body.Email, "phone": body.Phone, "role": "customer"}})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var body struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"code": "INVALID_INPUT", "message": err.Error()}})
		return
	}

	var id, name, phone, role, hash string
	err := h.DB.QueryRow(context.Background(),
		`SELECT id, name, phone, role, password_hash FROM users WHERE email=$1`, body.Email,
	).Scan(&id, &name, &phone, &role, &hash)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": gin.H{"code": "INVALID_CREDENTIALS", "message": "invalid email or password"}})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(body.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": gin.H{"code": "INVALID_CREDENTIALS", "message": "invalid email or password"}})
		return
	}

	h.issueTokens(c, id, role)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"id": id, "name": name, "email": body.Email, "phone": phone, "role": role}})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "logged out"}})
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	token, err := c.Cookie("refresh_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": gin.H{"code": "UNAUTHORIZED", "message": "missing refresh token"}})
		return
	}

	parsed, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(h.Secret), nil
	})
	if err != nil || !parsed.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": gin.H{"code": "UNAUTHORIZED", "message": "invalid refresh token"}})
		return
	}

	claims := parsed.Claims.(jwt.MapClaims)
	userID, _ := claims["sub"].(string)
	role, _ := claims["role"].(string)

	h.issueTokens(c, userID, role)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"message": "refreshed"}})
}

func (h *AuthHandler) Me(c *gin.Context) {
	userID, _ := c.Get("userID")
	var id, name, email, phone, role string
	err := h.DB.QueryRow(context.Background(),
		`SELECT id, name, email, phone, role FROM users WHERE id=$1`, userID,
	).Scan(&id, &name, &email, &phone, &role)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "NOT_FOUND", "message": "user not found"}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"id": id, "name": name, "email": email, "phone": phone, "role": role}})
}
