package routes

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/saurav-lal-karn/moniq/backend/internal/config"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/middleware"
	contactRoute "github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/route"
	iamroute "github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/route"
	transactionRoute "github.com/saurav-lal-karn/moniq/backend/internal/modules/ledger/route"
	tagRoute "github.com/saurav-lal-karn/moniq/backend/internal/modules/tag/route"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/user"
	walletRoute "github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/route"
	workspaceRoute "github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/route"
)

func SetupRouter(cfg *config.Config, db *pgxpool.Pool, rdb *redis.Client) *gin.Engine {
	txm := database.NewTxManager(db)

	router := gin.New()

	// Cors for router
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{cfg.ClientUrl}
	corsConfig.AllowCredentials = true
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Authorization", "Content-Type", "X-Workspace-Id"}

	router.Use(cors.New(corsConfig)) // CORS must be first to handle preflight
	router.Use(middleware.Logger()) // Custom structured logging middleware
	router.Use(gin.Recovery())      // Crash recovery

	// Standard Routes (Health and Readiness)
	router.GET("/health", func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
		defer cancel()

		dbStatus := "healthy"
		if err := db.Ping(ctx); err != nil {
			dbStatus = "unhealthy"
		}

		redisStatus := "healthy"
		if err := rdb.Ping(ctx).Err(); err != nil {
			redisStatus = "unhealthy"
		}

		status := http.StatusOK
		if dbStatus == "unhealthy" || redisStatus == "unhealthy" {
			status = http.StatusServiceUnavailable
		}

		c.JSON(status, gin.H{
			"status":   "OK",
			"postgres": dbStatus,
			"redis":    redisStatus,
			"time":     time.Now().Format(time.RFC3339),
		})
	})

	// Versioning of the api
	routeV1 := router.Group("/api/v1")

	// Register routes here
	user.RegisterRoutes(routeV1, db, cfg)

	// Register iam routes
	iamroute.RegisterIamRoutes(routeV1, txm, cfg)

	// Register workspace routes
	workspaceRoute.RegisterWorkspaceRoutes(routeV1, txm, cfg)

	// Register wallet routes
	walletRoute.RegisterWalletRoutes(routeV1, txm)

	// Register contact routes
	contactRoute.RegisterContactRoutes(routeV1, txm)

	// Register tag routes
	tagRoute.RegisterTagRoutes(routeV1, txm)

	// Register transaction routes
	transactionRoute.RegisterTransactionRoutes(routeV1, txm)

	return router
}