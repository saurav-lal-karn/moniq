package service

import (
	"context"

	"github.com/google/uuid"
	baseModel "github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/model"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/repository"
)

type walletTypeService struct {
	walletTypeRepo repository.WalletTypeRepository
}

type WalletTypeService interface {
	ListAll(ctx context.Context, workspaceID uuid.UUID) ([]*model.WalletType, error)
	Create(ctx context.Context, req *dto.CreateWalletTypeRequestDTO) error
	Delete(ctx context.Context, id uuid.UUID) error
}

func NewWalletTypeService(walletTypeRepo repository.WalletTypeRepository) WalletTypeService {
	return &walletTypeService{
		walletTypeRepo: walletTypeRepo,
	}
}

func (s *walletTypeService) ListAll(ctx context.Context, workspaceID uuid.UUID) ([]*model.WalletType, error) {
	return s.walletTypeRepo.List(ctx, workspaceID)
}

func (s *walletTypeService) Create(ctx context.Context, req *dto.CreateWalletTypeRequestDTO) error {
	walletType := &model.WalletType{
		BaseModel: baseModel.BaseModel{ID: uuid.New()},
		Name:        req.Name,
		Description: &req.Description,
		WorkspaceID: &req.WorkspaceID,
		CreatedBy:   &req.CreatedBy,
	}
	return s.walletTypeRepo.Create(ctx, walletType)	
}

func(s *walletTypeService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.walletTypeRepo.Delete(ctx, id)	
}