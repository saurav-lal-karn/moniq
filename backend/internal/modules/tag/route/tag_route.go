package route

import (
	"github.com/gin-gonic/gin"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/middleware"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/tag/handler"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/tag/repository"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/tag/service"

	memberRepository "github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/repository"
)

func RegisterTagRoutes(router *gin.RouterGroup, txm *database.TxManager) {
	memberRepo := memberRepository.NewWorkspaceMemberRepository(txm)

	tagRepo := repository.NewTagRepository(txm)
	tagService := service.NewTagService(tagRepo)
	tagHandler := handler.NewTagHandler(tagService)

	tagGroupRoutes := router.Group("tag")
	tagGroupRoutes.Use(middleware.Auth())
	tagGroupRoutes.Use(middleware.WorkspaceAccess(memberRepo))

	tagGroupRoutes.POST("", tagHandler.CreateTag)
	tagGroupRoutes.GET("", tagHandler.ListAll)
	tagGroupRoutes.GET("/:id", tagHandler.GetByID)
	tagGroupRoutes.PUT("/:id", tagHandler.UpdateTag)
	tagGroupRoutes.DELETE("/:id", tagHandler.DeleteTag)
}
