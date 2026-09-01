package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	baseModel "github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
	contactRepository "github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/repository"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/ledger/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/ledger/model"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/ledger/repository"
	tagModel "github.com/saurav-lal-karn/moniq/backend/internal/modules/tag/model"
	tagRepository "github.com/saurav-lal-karn/moniq/backend/internal/modules/tag/repository"
	walletRepository "github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/repository"
)

type transactionService struct {
	txm *database.TxManager

	transactionRepo repository.TransactionRepository
	transactionItemRepo repository.TransactionItemRepository
	ledgerRepo repository.LedgerRepository
	contactRepo contactRepository.ContactRepository
	walletRepo walletRepository.WalletRepository
	tagRepo tagRepository.TagRepository
	txTagRepo tagRepository.TransactionTagRepository
}

type TransactionService interface {
	CreateTransaction(ctx context.Context, tx *dto.CreateTransactionRequestDTO) error
	List(ctx context.Context, workspaceID uuid.UUID, req *helper.PaginationRequest) ([]*model.TransactionDetails, int, error)
	GetByID(ctx context.Context, id uuid.UUID) (*model.TransactionDetails, error)
	Update(ctx context.Context, tx *dto.UpdateTransactionRequestDTO) error
	Delete(ctx context.Context, id uuid.UUID, workspaceID uuid.UUID) error
}

func NewTransactionService(txm *database.TxManager, transactionRepo repository.TransactionRepository, transactionItemRepo repository.TransactionItemRepository, ledgerRepo repository.LedgerRepository, contactRepo contactRepository.ContactRepository, walletRepo walletRepository.WalletRepository, tagRepository tagRepository.TagRepository, txTagRepo tagRepository.TransactionTagRepository) TransactionService {
	return &transactionService{
		txm: txm,
		transactionRepo: transactionRepo,
		transactionItemRepo: transactionItemRepo,
		ledgerRepo: ledgerRepo,
		contactRepo: contactRepo,
		walletRepo: walletRepo,
		tagRepo: tagRepository,
		txTagRepo: txTagRepo,
	}
}

func (s *transactionService) CreateTransaction(ctx context.Context, tx *dto.CreateTransactionRequestDTO) error {
	// Check if the wallet is exist
	walletExists, err := s.walletRepo.CheckIfExists(ctx, tx.WalletID)
	if err != nil {
		return err
	}
	if !walletExists {
		return helper.ErrWalletNotFound
	}

	contactExists, err := s.contactRepo.CheckIfExists(ctx, *tx.ContactID)
	if err != nil {
		return err
	}
	if !contactExists {
		return helper.ErrContactNotFound
	}

	transaction := model.Transaction{
		BaseModel: baseModel.BaseModel{ID: uuid.New()},
		Amount: tx.Amount,
		Date: tx.Date.Time,
		Description: tx.Description,
		Type: model.TransactionType(tx.Type),
		WalletID: tx.WalletID,
		ContactID: tx.ContactID,
		WorkspaceID: tx.WorkspaceID,
		CreatedBy: tx.CreatedBy,
	}

	destinationTransactionID := uuid.New()


	err = s.txm.Run(ctx, func(ctx context.Context) error {
		// Add the transaction saving into the database transactions
		if err := s.transactionRepo.Create(ctx, &transaction); err != nil {
			return err
		}

		// Check for the tags, if they exist in workspace add them, if not create a new tag and add them to transaction_tags
		if len(tx.Tags) > 0 {
			for _, tagName := range tx.Tags {
				tagID := uuid.New()
				tagDetails, err := s.tagRepo.GetByName(ctx, tagName, tx.WorkspaceID)
				if err != nil {
					if err == helper.ErrTagNotFound {
						tag := tagModel.Tag{
							BaseModel: baseModel.BaseModel{ID: tagID},
							Name: tagName,
							WorkspaceID: &tx.WorkspaceID,
							CreatedBy: &tx.CreatedBy,
						}
						
						if err := s.tagRepo.Create(ctx, &tag); err != nil {
							return err
						}
					} else {
						return err
					}
				} else {
					tagID = tagDetails.ID
				}

				transactionTag := tagModel.TransactionTag{
					TransactionID: transaction.ID,
					TagID: tagID,
				}
				if err := s.txTagRepo.Create(ctx, &transactionTag); err != nil {
					return err
				}
			}
		}
		
		if tx.Type == string(model.TransferIn) || tx.Type == string(model.TransferOut) {
			destinationWalletExists, err := s.walletRepo.CheckIfExists(ctx, *tx.DestinationWalletID)
			if err != nil {
				return err
			}
			if !destinationWalletExists {
				return helper.ErrWalletNotFound
			}
			
			destinationTransaction := model.Transaction{
				BaseModel: baseModel.BaseModel{ID: destinationTransactionID},
				Amount: tx.Amount,
				Date: tx.Date.Time,
				Description: tx.Description,
				Type: model.TransactionType(tx.Type),
				WalletID: *tx.DestinationWalletID,
				ContactID: tx.ContactID,
				WorkspaceID: tx.WorkspaceID,
				CreatedBy: tx.CreatedBy,
			}
			
			// Add the transaction in the destination wallet as well
			if err := s.transactionRepo.Create(ctx, &destinationTransaction); err != nil {
				return err
			}
		}

		// Add the transaction items
		if len(tx.Items) > 0 {
			for _, item := range tx.Items {
				transactionItem := model.TransactionItem{
					BaseModel: baseModel.BaseModel{ID: uuid.New()},
					TransactionID: transaction.ID,
					CreatedBy: tx.CreatedBy,
					Name: item.Name,
					Quantity: int64(item.Quantity),
					Price: item.Price,
					Total: item.Total,
				}
				if err := s.transactionItemRepo.Create(ctx, &transactionItem); err != nil {
					return err
				}
			}
		}

		// Add the ledger entry based on the transaction type
		var ledgerEntry *model.LedgerEntry
		var destinationLedgerEntry *model.LedgerEntry
		switch tx.Type {
			case string(model.Expense):
				ledgerEntry = &model.LedgerEntry{
					BaseModel: baseModel.BaseModel{ID: uuid.New()},
					Amount: tx.Amount,
					Date: tx.Date.Time,
					Description: tx.Description,
					Direction: model.CreditDirection,
					TransactionID: transaction.ID,
					WalletID: tx.WalletID,
					WorkspaceID: tx.WorkspaceID,
					CreatedBy: tx.CreatedBy,
				}
			
			case string(model.Income):
				ledgerEntry = &model.LedgerEntry{
					BaseModel: baseModel.BaseModel{ID: uuid.New()},
					Amount: tx.Amount,
					Date: tx.Date.Time,
					Description: tx.Description,
					Direction: model.DebitDirection,
					TransactionID: transaction.ID,
					WalletID: tx.WalletID,
					WorkspaceID: tx.WorkspaceID,
					CreatedBy: tx.CreatedBy,
				}

			case string(model.TransferIn):
				ledgerEntry = &model.LedgerEntry{
					BaseModel: baseModel.BaseModel{ID: uuid.New()},
					Amount: tx.Amount,
					Date: tx.Date.Time,
					Description: tx.Description,
					Direction: model.DebitDirection,
					TransactionID: transaction.ID,
					WalletID: tx.WalletID,
					WorkspaceID: tx.WorkspaceID,
					CreatedBy: tx.CreatedBy,
				}

				destinationLedgerEntry = &model.LedgerEntry{
					BaseModel: baseModel.BaseModel{ID: uuid.New()},
					Amount: tx.Amount,
					Date: tx.Date.Time,
					Description: tx.Description,
					Direction: model.CreditDirection,
					TransactionID: destinationTransactionID,
					WalletID: *tx.DestinationWalletID,
					WorkspaceID: tx.WorkspaceID,
					CreatedBy: tx.CreatedBy,
				}
				
			case string(model.TransferOut):
				ledgerEntry = &model.LedgerEntry{
					BaseModel: baseModel.BaseModel{ID: uuid.New()},
					Amount: tx.Amount,
					Date: tx.Date.Time,
					Description: tx.Description,
					Direction: model.CreditDirection,
					TransactionID: transaction.ID,
					WalletID: tx.WalletID,
					WorkspaceID: tx.WorkspaceID,
					CreatedBy: tx.CreatedBy,
				}
				
				destinationLedgerEntry = &model.LedgerEntry{
					BaseModel: baseModel.BaseModel{ID: uuid.New()},
					Amount: tx.Amount,
					Date: tx.Date.Time,
					Description: tx.Description,
					Direction: model.DebitDirection,
					TransactionID: destinationTransactionID,
					WalletID: *tx.DestinationWalletID,
					WorkspaceID: tx.WorkspaceID,
					CreatedBy: tx.CreatedBy,
				}

			case string(model.Other):
				ledgerEntry = &model.LedgerEntry{
					BaseModel: baseModel.BaseModel{ID: uuid.New()},
					Amount: tx.Amount,
					Date: tx.Date.Time,
					Description: tx.Description,
					Direction: model.CreditDirection,
					TransactionID: transaction.ID,
					WalletID: tx.WalletID,
					WorkspaceID: tx.WorkspaceID,
					CreatedBy: tx.CreatedBy,
				}
			}

		// Saving the ledger entries into the database transactions
		if err := s.ledgerRepo.Create(ctx, ledgerEntry); err != nil {
			return err
		}
		if destinationLedgerEntry != nil {
			if err := s.ledgerRepo.Create(ctx, destinationLedgerEntry); err != nil {
				return err
			}
		}

		return nil
	})

	return err
}

func (s *transactionService) List(ctx context.Context, workspaceID uuid.UUID, req *helper.PaginationRequest) ([]*model.TransactionDetails, int, error) {
	return s.transactionRepo.List(ctx, workspaceID, req)
}

func (s *transactionService) GetByID(ctx context.Context, id uuid.UUID) (*model.TransactionDetails, error) {
	txn, err := s.transactionRepo.GetByID(ctx, id)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, helper.ErrTransactionNotFound
		}
		return nil, err
	}
	
	return txn, nil
}

func (s *transactionService) Update(ctx context.Context, tx *dto.UpdateTransactionRequestDTO) error {
	// Check if transaction exists
	exists, err := s.transactionRepo.CheckIfExists(ctx, tx.ID, tx.WorkspaceID)
	if err != nil {
		return err
	}
	if !exists {
		return helper.ErrTransactionNotFound
	}

	// Check if transaction wallet id is valid
	// Check if the wallet is exist
	walletExists, err := s.walletRepo.CheckIfExists(ctx, tx.WalletID)
	if err != nil {
		return err
	}
	if !walletExists {
		return helper.ErrWalletNotFound
	}

	contactExists, err := s.contactRepo.CheckIfExists(ctx, *tx.ContactID)
	if err != nil {
		return err
	}
	if !contactExists {
		return helper.ErrContactNotFound
	}
	
	if tx.Type == string(model.TransferIn) || tx.Type == string(model.TransferOut) {
		if tx.DestinationWalletID == nil {
			return helper.ErrDestinationWalletIDRequired
		}
		destinationWalletExists, err := s.walletRepo.CheckIfExists(ctx, *tx.DestinationWalletID)
		if err != nil {
			return err
		}
		if !destinationWalletExists {
			return helper.ErrWalletNotFound
		}
	}

	transaction := model.Transaction{
		BaseModel: baseModel.BaseModel{ID: tx.ID},
		Amount: tx.Amount,
		Date: tx.Date.Time,
		Description: tx.Description,
		Type: model.TransactionType(tx.Type),
		WalletID: tx.WalletID,
		ContactID: tx.ContactID,
		WorkspaceID: tx.WorkspaceID,
		CreatedBy: tx.CreatedBy,
	}

	// Add the transaction saving into the database transactions
	err = s.txm.Run(ctx, func(ctx context.Context) error {
		// Add the transaction saving into the database transactions
		if err := s.transactionRepo.Update(ctx, &transaction); err != nil {
			return err
		}

		// TODO: Handle the tags updating and updating the ledger entry based on the transaction type

		return nil
	})

	return err
}

func (s *transactionService) Delete(ctx context.Context, id uuid.UUID, workspaceID uuid.UUID) error {
	exists, err := s.transactionRepo.CheckIfExists(ctx, id, workspaceID)
	if err != nil {
		return err
	}
	if !exists {
		return helper.ErrTransactionNotFound
	}

	return s.transactionRepo.Delete(ctx, id)
}