package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
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
	Update(ctx context.Context, userID uuid.UUID, workspaceID uuid.UUID, wallet *dto.UpdateWalletRequestDTO) error
	Delete(ctx context.Context, id uuid.UUID,  userID uuid.UUID, workspaceID uuid.UUID) error
}

func NewWalletService(walletRepo repository.WalletRepository, walletTypeRepo repository.WalletTypeRepository) WalletService {
	return &walletService{
		walletRepo: walletRepo,
		walletTypeRepo: walletTypeRepo,
	}
}

func (s *walletService) CreateWallet(ctx context.Context, req *dto.CreateWalletRequestDTO) (error) {
	if req.TypeID == uuid.Nil {
		return helper.ErrWalletTypeNotFound
	}
	// check if wallet type exists in the database
	_, err := s.walletTypeRepo.GetByID(ctx, req.TypeID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return helper.ErrWalletTypeNotFound
		}
		return err
	}

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
	wallet, err := s.walletRepo.GetByID(ctx, id)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, helper.ErrWalletNotFound
		}
		return nil, err
	}

	return wallet, nil
}

func (s *walletService) List(ctx context.Context, userID uuid.UUID, workspaceID uuid.UUID) ([]*model.Wallet, error) {
	return s.walletRepo.List(ctx, userID, workspaceID)
}

func (s *walletService) Update(ctx context.Context, userID uuid.UUID, workspaceID uuid.UUID, req *dto.UpdateWalletRequestDTO) error {
	_, err := s.walletRepo.GetByID(ctx, req.ID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return helper.ErrWalletNotFound
		}
		return err
	}

	// Check if the user is the owner
	owns, err := s.walletRepo.CheckOwnerOfWallet(ctx, req.ID, userID, workspaceID)
	if err != nil {
		return err
	}

	if !owns {
		return helper.ErrUnauthorized
	}

	// check wallet type
	_, err = s.walletTypeRepo.GetByID(ctx, req.TypeID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return helper.ErrWalletTypeNotFound
		}
		return err
	}

	updatedWallet := &model.Wallet{
		BaseModel: baseModel.BaseModel{ID: req.ID},
		Name:        req.Name,
		Description: &req.Description,
		Currency:    req.Currency,
		TypeID:      req.TypeID,
		WorkspaceID: req.WorkspaceID,
		CreatedBy:   req.CreatedBy,
	}

	return s.walletRepo.Update(ctx, updatedWallet)
}

func (s *walletService) Delete(ctx context.Context, id uuid.UUID, userID uuid.UUID, workspaceID uuid.UUID) error {
	_, err := s.walletRepo.GetByID(ctx, id)
	if err != nil {
		if err == pgx.ErrNoRows {
			return helper.ErrWalletNotFound
		}
		return err
	}

	// Check if the user is the owner
	owns, err := s.walletRepo.CheckOwnerOfWallet(ctx, id, userID, workspaceID)
	if err != nil {
		return err
	}

	if !owns {
		return helper.ErrUnauthorized
	}

	err = s.walletRepo.Delete(ctx, id)
	if err != nil {
		return err
	}

	return nil
}