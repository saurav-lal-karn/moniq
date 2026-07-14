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
	inviteService := service.NewInviteService(inviteRepo, workspaceRepo, memberRepo, iamRepo, mail, cfg.ClientUrl)

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

	workspaceMemberRoutes := workspaceRoutes.Group("member")
	workspaceMemberRoutes.Use(middleware.WorkspaceAccess(memberRepo))
	workspaceMemberRoutes.POST("", workspaceMemberHandler.CreateMember)
	workspaceMemberRoutes.GET("", workspaceMemberHandler.ListMembers)

	workspaceInviteRoutes := router.Group("invite")
	workspaceInviteRoutes.Use(middleware.Auth())
	workspaceInviteRoutes.Use(middleware.WorkspaceAccess(memberRepo))
	workspaceInviteRoutes.POST("", inviteHandler.InviteUserToWorkspace)
	workspaceInviteRoutes.GET("", inviteHandler.GetInvitationList)
	workspaceInviteRoutes.POST("/revoke", inviteHandler.RevokeInvitation)
	workspaceInviteRoutes.POST("/resend", inviteHandler.ResendInvitation)
	workspaceInviteRoutes.POST("/remove", inviteHandler.RemoveInvitation)


	invitationRoutes := router.Group("invitation")
	invitationRoutes.GET("/details", inviteHandler.GetInvitationDetails)

	authInvitationRoutes := router.Group("invitation")
	authInvitationRoutes.Use(middleware.Auth())
	authInvitationRoutes.POST("/accept", inviteHandler.AcceptInvitation)
	authInvitationRoutes.POST("/decline", inviteHandler.DeclineInvitation)
}