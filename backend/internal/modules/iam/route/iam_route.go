package route

import (
	"github.com/gin-gonic/gin"
	"github.com/saurav-lal-karn/moniq/backend/internal/config"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/middleware"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/handler"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/repository"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/service"
	workspaceRepository "github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/repository"
	workspaceService "github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/service"
	"github.com/saurav-lal-karn/moniq/backend/pkg/mailer"
)

func RegisterIamRoutes(route *gin.RouterGroup, txm *database.TxManager, cfg *config.Config) {
	iamRepo := repository.NewIAMRepository(txm)

	workspaceRepo := workspaceRepository.NewWorkspaceRepository(txm)
	workspaceMemberRepo := workspaceRepository.NewWorkspaceMemberRepository(txm)
	wsService := workspaceService.NewWorkspaceService(txm, workspaceRepo, workspaceMemberRepo)

	// LogMailer in dev (no API key), real provider in prod.
	mail := mailer.New(cfg.EmailAPIKey, cfg.EmailFrom)

	iamService := service.NewIAMService(txm, iamRepo, wsService, mail, cfg.AppBaseURL)
	iamHandler := handler.NewIAMHandler(iamService)

	// Unprotected auth routes
	authRoutes := route.Group("auth")
	authRoutes.POST("/register", iamHandler.Register)
	authRoutes.POST("/login", iamHandler.Login)
	authRoutes.POST("/refresh", iamHandler.Refresh)

	// Protected routes for user
	userRoutes := authRoutes.Group("/")
	userRoutes.Use(middleware.Auth())
	userRoutes.GET("/me", iamHandler.Me)

	// Define other IAM-related routes here (e.g., login, user management, etc.)
}