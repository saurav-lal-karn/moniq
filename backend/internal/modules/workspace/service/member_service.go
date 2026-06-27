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

type memberService struct {
	txm           *database.TxManager
	repo          repository.WorkspaceMemberRepository
	workspaceRepo repository.WorkspaceRepository
}


type MemberService interface {
	CreateMember(ctx context.Context, req dto.CreateWorkspaceMemberDTO) (error)
	RemoveMember(ctx context.Context, userID uuid.UUID, workspaceID uuid.UUID) error
	UpdateMemberRole(ctx context.Context, workspaceID uuid.UUID) error
	ListMembers(ctx context.Context, workspaceID uuid.UUID) ([]*model.WorkspaceDetailsMember, error)
}

func NewMemberService(txm *database.TxManager, repo repository.WorkspaceMemberRepository, workspaceRepo repository.WorkspaceRepository) MemberService {
	return &memberService{
		txm:           txm,
		repo:          repo,
		workspaceRepo: workspaceRepo,
	}
}


// InviteMember implements MemberService.
func (m *memberService) CreateMember(ctx context.Context, req dto.CreateWorkspaceMemberDTO) (error) {
	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		return err
	}

	wm := &model.WorkspaceMember{
		BaseModel: baseModel.BaseModel{ID: uuid.New()},
		WorkspaceID: req.WorkspaceID,
		UserID: userID,
		Role: model.WorkspaceMemberRole(req.Role),
		CreatedBy: req.CreatedBY,
	}

	err = m.repo.AddMemberToWorkspace(ctx, wm)
	if err != nil {
		return err
	}

	return nil
}

// ListMembers implements MemberService.
func (m *memberService) ListMembers(ctx context.Context, workspaceID uuid.UUID) ([]*model.WorkspaceDetailsMember, error) {
	members, err := m.repo.ListMembersInWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	return members, nil
}

// RemoveMember implements MemberService.
func (m *memberService) RemoveMember(ctx context.Context, userID uuid.UUID, workspaceID uuid.UUID) error {
	panic("unimplemented")
}

// UpdateMemberRole implements MemberService.
func (m *memberService) UpdateMemberRole(ctx context.Context, workspaceID uuid.UUID) error {
	panic("unimplemented")
}