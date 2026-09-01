package mapper

import (
	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/ledger/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/ledger/model"
)

func ToTransactionResponse(transactionModel *model.Transaction) dto.TransactionResponseDTO {
	return dto.TransactionResponseDTO{
		ID: transactionModel.ID.String(),
		Amount: transactionModel.Amount,
		Date: transactionModel.Date,
		Description: transactionModel.Description,
		Type: string(transactionModel.Type),
		WalletID: transactionModel.WalletID,
		ContactID: transactionModel.ContactID,
		WorkspaceID: transactionModel.WorkspaceID,
		CreatedBy: transactionModel.CreatedBy,
	}
}

func ToTransactionListResponse(transactions []*model.Transaction) []dto.TransactionResponseDTO {
	var result []dto.TransactionResponseDTO
	for _, transaction := range transactions {
		result = append(result, ToTransactionResponse(transaction))
	}
	return result
}

func ToTransactionDetailsResponse(transactionDetailsModel *model.TransactionDetails) dto.TransactionResponseDTO {
	var transactionItems []dto.TransactionItemResponseDTO
	for _, item := range transactionDetailsModel.Items {
		transactionItems = append(transactionItems, dto.TransactionItemResponseDTO{
			ID: item.ID,
			Name: item.Name,
			Quantity: item.Quantity,
			Price: item.Price,
			Total: item.Total,
		})
	}

	var wallet dto.TransactionWalletResponseDTO
	if transactionDetailsModel.Wallet.ID != uuid.Nil {
		wallet = dto.TransactionWalletResponseDTO{
			ID: transactionDetailsModel.Wallet.ID.String(),
			Name: transactionDetailsModel.Wallet.Name,
		}
	}

	var contact dto.TransactionContactResponseDTO
	if transactionDetailsModel.Contact.ID != uuid.Nil {
		contact = dto.TransactionContactResponseDTO{
			ID: transactionDetailsModel.Contact.ID.String(),
			Name: transactionDetailsModel.Contact.Name,
		}
	}

	var tags []dto.TransactionTagResponseDTO
	for _, tag := range transactionDetailsModel.Tags {
		tags = append(tags, dto.TransactionTagResponseDTO{
			ID: tag.ID,
			Name: tag.Name,
		})
	}
	return dto.TransactionResponseDTO{
		ID: transactionDetailsModel.ID,
		Amount: transactionDetailsModel.Amount,
		Date: transactionDetailsModel.Date,
		Description: transactionDetailsModel.Description,
		Type: string(transactionDetailsModel.Type),
		WalletID: transactionDetailsModel.WalletID,
		ContactID: &transactionDetailsModel.ContactID,
		WorkspaceID: transactionDetailsModel.WorkspaceID,
		CreatedBy: transactionDetailsModel.CreatedBy,
		Items: transactionItems,
		Wallet: wallet,
		Contact: contact,
		Tags: tags,
	}
}

func ToTransactonDetailsListResponse(transactions []*model.TransactionDetails) []dto.TransactionResponseDTO {
	var result []dto.TransactionResponseDTO
	for _, transaction := range transactions {
		result = append(result, ToTransactionDetailsResponse(transaction))
	}
	return result
}