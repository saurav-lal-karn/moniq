package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/saurav-lal-karn/moniq/backend/internal/config"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/routes"
	"github.com/saurav-lal-karn/moniq/backend/pkg/logger"
)

func main() {
	// 1. Load Configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		slog.Error("Failed to load configuration", "error", err)
		os.Exit(1)
	}

	// 2. Initialize Structured Logger
	isProduction := cfg.Env == "production"
	logger.InitLogger(cfg.Env)

	logger.Info("Starting Moniq Backend API Server", logger.StringField("env", cfg.Env), logger.StringField("port", cfg.Port))

	// 3. Connect to PostgreSQL
	// Create a connection string from individual components for better flexibility
	databaseURL := "postgres://" + cfg.DatabaseUser + ":" + cfg.DatabasePassword + "@" + cfg.DatabaseHost + ":" + cfg.DatabasePort + "/" + cfg.DatabaseName + "?sslmode=" + cfg.DatabaseSSLMode
	db, err := database.ConnectPostgres(databaseURL)
	if err != nil {
		logger.Error("Database connection failed", logger.ErrorField(err))
		os.Exit(1)
	}
	defer db.Close()

	// 4. Connect to Redis
	rdb, err := database.ConnectRedis(cfg.RedisURL)
	if err != nil {
		logger.Error("Redis connection failed", logger.ErrorField(err))
		os.Exit(1)
	}
	defer rdb.Close()

	// 6. Set Gin Mode
	if isProduction {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// 8. Initialize router
	r := routes.SetupRouter(cfg, db, rdb)
	
	// 11. Configure HTTP Server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// 12. Graceful Server Shutdown Setup
	go func() {
		logger.Info("HTTP server running", logger.StringField("addr", srv.Addr))
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("ListenAndServe failed", logger.ErrorField(err))
			os.Exit(1)
		}
	}()

	// Wait for interrupt signal to gracefully shut down the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down HTTP server gracefully...")

	// The context is used to inform the server it has 5 seconds to finish
	// the request it is currently handling.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("Server forced to shutdown", logger.ErrorField(err))
	}

	slog.Info("Server stopped successfully")
}