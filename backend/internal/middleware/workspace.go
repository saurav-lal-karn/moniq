package middleware

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
)

type WorkspaceChecker interface {
	CheckUserExistsInWorkspace(ctx context.Context, userID uuid.UUID, workspaceID uuid.UUID) (bool, error)
}

func WorkspaceAccess(checker WorkspaceChecker) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		workspaceIdStr := ctx.GetHeader("X-Workspace-Id")
		if workspaceIdStr == "" {
			helper.ErrorResponse(ctx, http.StatusBadRequest, "X-Workspace-Id header is required")
			ctx.Abort()
			return
		}

		workspaceID, err := uuid.Parse(workspaceIdStr)
		if err != nil {
			helper.ErrorResponse(ctx, http.StatusBadRequest, "Invalid X-Workspace-Id header format")
			ctx.Abort()
			return
		}

		userId, exists := ctx.Get("userID")
		if !exists {
			helper.ErrorResponse(ctx, http.StatusUnauthorized, "User ID not found in context")
			ctx.Abort()
			return
		}

		var userID uuid.UUID
		switch v := userId.(type) {
		case string:
			userID, err = uuid.Parse(v)
			if err != nil {
				helper.ErrorResponse(ctx, http.StatusUnauthorized, "Invalid user ID format in context")
				ctx.Abort()
				return
			}
		case uuid.UUID:
			userID = v
		default:
			helper.ErrorResponse(ctx, http.StatusUnauthorized, "Invalid user ID type in context")
			ctx.Abort()
			return
		}

		hasAccess, err := checker.CheckUserExistsInWorkspace(ctx.Request.Context(), userID, workspaceID)
		if err != nil {
			helper.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to verify workspace access")
			ctx.Abort()
			return
		}

		if !hasAccess {
			helper.ErrorResponse(ctx, http.StatusForbidden, "You do not have access to this workspace")
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}
