package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/preamjigk/debloat/internal/config"
	"github.com/preamjigk/debloat/internal/db"
	"github.com/preamjigk/debloat/internal/handlers"
	"github.com/preamjigk/debloat/internal/middleware"
)

func main() {
	_ = godotenv.Load()
	cfg := config.Load()

	pool, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer pool.Close()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendOrigin},
		AllowMethods:     []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	auth := &handlers.AuthHandler{DB: pool, Secret: cfg.JWTSecret}
	meals := &handlers.MealsHandler{DB: pool}
	plans := &handlers.PlansHandler{DB: pool}
	slots := &handlers.SlotsHandler{DB: pool}
	cart := &handlers.CartHandler{DB: pool}
	addrs := &handlers.AddressesHandler{DB: pool}
	orders := &handlers.OrdersHandler{DB: pool, RazorpayKeyID: cfg.RazorpayKeyID, RazorpaySecret: cfg.RazorpaySecret}
	admin := &handlers.AdminHandler{DB: pool}
	webhook := &handlers.WebhookHandler{DB: pool, RazorpaySecret: cfg.RazorpaySecret}

	v1 := r.Group("/api/v1")

	// Auth
	v1.POST("/auth/register", auth.Register)
	v1.POST("/auth/login", auth.Login)
	v1.POST("/auth/logout", auth.Logout)
	v1.POST("/auth/refresh", auth.Refresh)

	// Public
	v1.GET("/meals", meals.List)
	v1.GET("/meals/:id", meals.Get)
	v1.GET("/plans", plans.List)
	v1.GET("/plans/:id", plans.Get)
	v1.GET("/slots", slots.List)

	// Customer (auth required)
	authMw := middleware.RequireAuth(cfg.JWTSecret)
	customer := v1.Group("/", authMw)
	customer.GET("/me", auth.Me)
	customer.GET("/cart", cart.Get)
	customer.POST("/cart", cart.Add)
	customer.PATCH("/cart/items/:id", cart.Update)
	customer.DELETE("/cart/items/:id", cart.Remove)
	customer.DELETE("/cart", cart.Clear)
	customer.GET("/addresses", addrs.List)
	customer.POST("/addresses", addrs.Create)
	customer.POST("/orders", orders.Create)
	customer.GET("/orders", orders.List)
	customer.GET("/orders/:id", orders.Get)

	// Webhook (no auth — signature verified inside handler)
	v1.POST("/webhooks/razorpay", webhook.Razorpay)

	// Admin
	adminGrp := v1.Group("/admin", authMw, middleware.RequireAdmin())
	adminGrp.GET("/orders", admin.ListOrders)
	adminGrp.PATCH("/orders/:id/status", admin.UpdateOrderStatus)
	adminGrp.PATCH("/meals/:id/availability", admin.SetMealAvailability)

	log.Printf("listening on :%s", cfg.Port)
	r.Run(":" + cfg.Port)
}
