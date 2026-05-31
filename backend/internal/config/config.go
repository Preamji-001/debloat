package config

import "os"

type Config struct {
	DatabaseURL     string
	JWTSecret       string
	RazorpayKeyID   string
	RazorpaySecret  string
	Port            string
	Env             string
	FrontendOrigin  string
}

func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	return Config{
		DatabaseURL:    os.Getenv("DATABASE_URL"),
		JWTSecret:      os.Getenv("JWT_SECRET"),
		RazorpayKeyID:  os.Getenv("RAZORPAY_KEY_ID"),
		RazorpaySecret: os.Getenv("RAZORPAY_KEY_SECRET"),
		Port:           port,
		Env:            os.Getenv("ENV"),
		FrontendOrigin: os.Getenv("FRONTEND_ORIGIN"),
	}
}
