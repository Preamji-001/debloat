package models

import "time"

type User struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	Phone        string    `json:"phone"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
}

type Meal struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
	Category    string  `json:"category"`
	Kcal        int     `json:"kcal"`
	ProteinG    int     `json:"protein_g"`
	CarbsG      int     `json:"carbs_g"`
	FatG        int     `json:"fat_g"`
	PricePaise  int     `json:"price_paise"`
	ImageURL    *string `json:"image_url"`
	IsAvailable bool    `json:"is_available"`
}

type MealPlan struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
	MealCount   int     `json:"meal_count"`
	PricePaise  int     `json:"price_paise"`
	DiscountPct int     `json:"discount_pct"`
	IsActive    bool    `json:"is_active"`
}

type DeliverySlot struct {
	ID          string `json:"id"`
	Date        string `json:"date"`
	Label       string `json:"label"`
	Capacity    int    `json:"capacity"`
	BookedCount int    `json:"booked_count"`
	IsActive    bool   `json:"is_active"`
}

type Address struct {
	ID        string  `json:"id"`
	UserID    string  `json:"-"`
	Label     *string `json:"label"`
	Line1     string  `json:"line1"`
	City      string  `json:"city"`
	Pincode   string  `json:"pincode"`
	IsDefault bool    `json:"is_default"`
}

type CartItem struct {
	ID     string `json:"id"`
	UserID string `json:"-"`
	MealID string `json:"meal_id"`
	Meal   *Meal  `json:"meal,omitempty"`
	Qty    int    `json:"quantity"`
}

type Order struct {
	ID              string      `json:"id"`
	UserID          string      `json:"-"`
	AddressID       string      `json:"address_id"`
	SlotID          string      `json:"slot_id"`
	Status          string      `json:"status"`
	TotalPaise      int         `json:"total_paise"`
	RazorpayOrderID string      `json:"razorpay_order_id,omitempty"`
	CreatedAt       time.Time   `json:"created_at"`
	DeliverySlot    *DeliverySlot `json:"delivery_slot,omitempty"`
	Items           []OrderItem `json:"items,omitempty"`
}

type OrderItem struct {
	ID         string `json:"id"`
	OrderID    string `json:"-"`
	MealID     string `json:"meal_id"`
	MealName   string `json:"meal_name"`
	Quantity   int    `json:"quantity"`
	PricePaise int    `json:"price_paise"`
}
