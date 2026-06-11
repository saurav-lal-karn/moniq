package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	baseModel "github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/model"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/repository"
)

type workspaceService struct {
	txm        *database.TxManager
	repo       repository.WorkspaceRepository
	memberRepo repository.WorkspaceMemberRepository
}

type WorkspaceService interface {
	// Create provisions a workspace and registers OwnerID as its owner member,
	// atomically. Safe to call standalone or inside an outer transaction — the
	// nested TxManager.Run joins the existing transaction when one is active.
	Create(ctx context.Context, req dto.CreateWorkspaceRequestDTO) (*model.Workspace, error)
}

func NewWorkspaceService(txm *database.TxManager, repo repository.WorkspaceRepository, memberRepo repository.WorkspaceMemberRepository) WorkspaceService {
	return &workspaceService{
		txm:        txm,
		repo:       repo,
		memberRepo: memberRepo,
	}
}

func (s *workspaceService) Create(ctx context.Context, req dto.CreateWorkspaceRequestDTO) (*model.Workspace, error) {
	ws := &model.Workspace{
		BaseModel:   baseModel.BaseModel{ID: uuid.New()},
		Name:        req.Name,
		Description: req.Description,
		Type:        req.Type,
		CreatedBy:   req.OwnerID,
	}

	owner := &model.WorkspaceMember{
		BaseModel:   baseModel.BaseModel{ID: uuid.New()},
		WorkspaceID: ws.ID,
		UserID:      req.OwnerID,
		Role:        model.OwnerRole,
		CreatedBy:   req.OwnerID,
	}

	if err := s.txm.Run(ctx, func(ctx context.Context) error {
		if err := s.repo.CreateWorkspace(ctx, ws); err != nil {
			return err
		}
		return s.memberRepo.AddMemberToWorkspace(ctx, owner)
	}); err != nil {
		return nil, err
	}

	return ws, nil
}
