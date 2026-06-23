package route

import (
	"github.com/gin-gonic/gin"
	"github.com/saurav-lal-karn/moniq/backend/internal/config"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/middleware"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/handler"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/repository"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/service"
)

func RegisterWorkspaceRoutes(router *gin.RouterGroup,txm *database.TxManager, cfg *config.Config) {
	workspaceRepo := repository.NewWorkspaceRepository(txm)
	memberRepo := repository.NewWorkspaceMemberRepository(txm)
	workspaceService := service.NewWorkspaceService(txm, workspaceRepo, memberRepo)
	workspaceHandler := handler.NewWorkspaceHandler(workspaceService)

	// Workspace Routes
	workspaceRoutes := router.Group("workspace")
	workspaceRoutes.Use(middleware.Auth())

	// Workspace CRUD routes
	workspaceRoutes.POST("/create", workspaceHandler.CreateWorkspace)
	workspaceRoutes.GET("/list", workspaceHandler.ListMyWorkspaces)
	workspaceRoutes.GET("/details/:id", workspaceHandler.GetWorkspaceDetails)
	workspaceRoutes.PUT("/:id", workspaceHandler.UpdateWorkspace)
	workspaceRoutes.DELETE("/:id", workspaceHandler.DeleteWorkspace)
}