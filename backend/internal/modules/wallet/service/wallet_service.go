package service

import (
	"context"

	"github.com/google/uuid"
	baseModel "github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/model"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/repository"
)

type walletService struct {
	walletRepo repository.WalletRepository
	walletTypeRepo repository.WalletTypeRepository
}

type WalletService interface {
	CreateWallet(ctx context.Context, req *dto.CreateWalletRequestDTO) (error)
	GetByID(ctx context.Context, id uuid.UUID) (*model.Wallet, error)
	List(ctx context.Context, userID uuid.UUID, workspaceID uuid.UUID) ([]*model.Wallet, error)
	Update(ctx context.Context, wallet *model.Wallet) error
	Delete(ctx context.Context, id uuid.UUID) error
}

func NewWalletService(walletRepo repository.WalletRepository, walletTypeRepo repository.WalletTypeRepository) WalletService {
	return &walletService{
		walletRepo: walletRepo,
		walletTypeRepo: walletTypeRepo,
	}
}

func (s *walletService) CreateWallet(ctx context.Context, req *dto.CreateWalletRequestDTO) (error) {
	wallet := &model.Wallet{
		BaseModel: baseModel.BaseModel{ID: uuid.New()},
		Name:        req.Name,
		Description: &req.Description,
		Currency:    req.Currency,
		TypeID:      req.TypeID,
		WorkspaceID: req.WorkspaceID,
		CreatedBy:   req.CreatedBy,
	}
	return s.walletRepo.Create(ctx, wallet)
}

func (s *walletService) GetByID(ctx context.Context, id uuid.UUID) (*model.Wallet, error) {
	return s.walletRepo.GetByID(ctx, id)
}

func (s *walletService) List(ctx context.Context, userID uuid.UUID, workspaceID uuid.UUID) ([]*model.Wallet, error) {
	return s.walletRepo.List(ctx, userID, workspaceID)
}

func (s *walletService) Update(ctx context.Context, wallet *model.Wallet) error {
	return s.walletRepo.Update(ctx, wallet)
}

func (s *walletService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.walletRepo.Delete(ctx, id)
}