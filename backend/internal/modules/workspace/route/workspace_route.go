package route

import (
	"github.com/gin-gonic/gin"
	"github.com/saurav-lal-karn/moniq/backend/internal/config"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/middleware"
	iamRepository "github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/repository"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/handler"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/repository"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/service"
	"github.com/saurav-lal-karn/moniq/backend/pkg/mailer"
)

func RegisterWorkspaceRoutes(router *gin.RouterGroup,txm *database.TxManager, cfg *config.Config) {
	workspaceRepo := repository.NewWorkspaceRepository(txm)
	memberRepo := repository.NewWorkspaceMemberRepository(txm)
	inviteRepo := repository.NewInviteRepository(txm)
	iamRepo := iamRepository.NewIAMRepository(txm)

	// LogMailer in dev (no API key), real provider in prod.
	mail := mailer.New(cfg.EmailAPIKey, cfg.EmailFrom)


	workspaceService := service.NewWorkspaceService(txm, workspaceRepo, memberRepo)
	workspaceMemberService := service.NewMemberService(txm, memberRepo, workspaceRepo)
	inviteService := service.NewInviteService(inviteRepo, workspaceRepo, memberRepo, iamRepo, mail, cfg.AppBaseURL)

	workspaceHandler := handler.NewWorkspaceHandler(workspaceService)
	workspaceMemberHandler := handler.NewMemberHandler(workspaceMemberService)
	inviteHandler := handler.NewInviteHandler(inviteService)

	// Workspace Routes
	workspaceRoutes := router.Group("workspace")
	workspaceRoutes.Use(middleware.Auth())

	// Workspace CRUD routes
	workspaceRoutes.POST("/create", workspaceHandler.CreateWorkspace)
	workspaceRoutes.GET("/list", workspaceHandler.ListMyWorkspaces)
	workspaceRoutes.GET("/details/:id", workspaceHandler.GetWorkspaceDetails)
	workspaceRoutes.PUT("/:id", workspaceHandler.UpdateWorkspace)
	workspaceRoutes.DELETE("/:id", workspaceHandler.DeleteWorkspace)

	workspaceMemberRoutes := workspaceRoutes.Group(":id/member")
	workspaceMemberRoutes.POST("", workspaceMemberHandler.CreateMember)

	workspaceInviteRoutes := workspaceRoutes.Group(":id/invite")
	workspaceInviteRoutes.POST("", inviteHandler.InviteUserToWorkspace)
	workspaceInviteRoutes.GET("", inviteHandler.GetInvitationList)

	invitationRoutes := router.Group("invitation")
	invitationRoutes.POST("/accept", inviteHandler.AcceptInvitation)
	invitationRoutes.POST("/decline", inviteHandler.DeclineInvitation)
}