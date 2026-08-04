package mapper

import (
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