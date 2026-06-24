package service

import (
	"context"

	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/repository"
)

type inviteService struct {
	repo repository.InviteRepository
}

type InviteService interface {
	InviteUserToWorkspace(ctx context.Context, req dto.InviteUserToWorkspaceDTO) error
	AcceptInviteToWorkspace(ctx context.Context, token string) error
	DeclineInviteToWorkspace(ctx context.Context, token string) error
}

func NewInviteService(repo repository.InviteRepository) InviteService {
	return &inviteService{
		repo: repo,
	}
}

// InviteUserToWorkspace implements InviteService.
func (i *inviteService) InviteUserToWorkspace(ctx context.Context, req dto.InviteUserToWorkspaceDTO) error {
	
	return nil
}

// AcceptInviteToWorkspace implements InviteService.
func (i *inviteService) AcceptInviteToWorkspace(ctx context.Context, token string) error {
	panic("unimplemented")
}

// DeclineInviteToWorkspace implements InviteService.
func (i *inviteService) DeclineInviteToWorkspace(ctx context.Context, token string) error {
	panic("unimplemented")
}