package route

import (
	"github.com/gin-gonic/gin"
	"github.com/saurav-lal-karn/moniq/backend/internal/middleware"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/handler"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/repository"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/service"

	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	memberRepository "github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/repository"
)

func RegisterContactRoutes(router *gin.RouterGroup, txm *database.TxManager) {
	memberRepo := memberRepository.NewWorkspaceMemberRepository(txm)

	contactRepo := repository.NewContactRepository(txm)
	contactService := service.NewContactService(contactRepo)
	contactHandler := handler.NewContactHandler(contactService)

	contactGroupRoutes := router.Group("contact")
	contactGroupRoutes.Use(middleware.Auth())
	contactGroupRoutes.Use(middleware.WorkspaceAccess(memberRepo))

	contactGroupRoutes.POST("", contactHandler.CreateContact)
	contactGroupRoutes.GET("", contactHandler.ListAll)
	contactGroupRoutes.GET("/:id", contactHandler.GetByID)
	contactGroupRoutes.PUT("/:id", contactHandler.UpdateContact)
	contactGroupRoutes.DELETE("/:id", contactHandler.DeleteContact)
}
