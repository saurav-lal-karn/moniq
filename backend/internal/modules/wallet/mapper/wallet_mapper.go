package mapper

import (
	"fmt"

	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/model"
)

func ToWalletTypeResponse(walletTypeModel *model.WalletType) dto.WalletTypeResponseDTO {
	return dto.WalletTypeResponseDTO{
		ID: walletTypeModel.ID.String(),
		Name: walletTypeModel.Name,
		Description: walletTypeModel.Description,
		WorkspaceID: walletTypeModel.WorkspaceID,
		CreatedBy: walletTypeModel.CreatedBy,
	}
}

func ToWalletTypeResponseList(walletTypes []*model.WalletType) []dto.WalletTypeResponseDTO{
	result := make([]dto.WalletTypeResponseDTO, 0, len(walletTypes)) 
	
	for _, walletType := range walletTypes {
		result = append(result, ToWalletTypeResponse(walletType))
	}
	return result
}

func ToWalletResponse(walletModel *model.Wallet) dto.WalletResponseDTO {
	return dto.WalletResponseDTO{
		ID: walletModel.ID.String(),
		Name: walletModel.Name,
		Description: walletModel.Description,
		WorkspaceID: walletModel.WorkspaceID,
		CreatedBy: walletModel.CreatedBy,
		TypeID: walletModel.TypeID,
		Currency: walletModel.Currency,
	}
}

func ToWalletResponseList(wallets []*model.Wallet) []dto.WalletResponseDTO{
	result := make([]dto.WalletResponseDTO, 0, len(wallets)) 
	
	for _, wallet := range wallets {
		result = append(result, ToWalletResponse(wallet))
	}
	return result
}

func ToWalletLedgerDetailsResponse(walletLedgerDetailsModel *model.WalletLedgerDetails) dto.WalletLedgerDetailsResponseDTO {
	return dto.WalletLedgerDetailsResponseDTO{
		ID: walletLedgerDetailsModel.ID,
		Amount: walletLedgerDetailsModel.Amount,
		Date: walletLedgerDetailsModel.Date,
		Description: walletLedgerDetailsModel.Description,
		Direction: walletLedgerDetailsModel.Direction,
		TransactionID: walletLedgerDetailsModel.TransactionID,
	}
}

func ToWalletDetailsResponse(walletDetailsModel *model.WalletDetails) dto.WalletDetailsResponseDTO {
	ledgerEntries := make([]dto.WalletLedgerDetailsResponseDTO, 0, len(walletDetailsModel.LedgerEntries))
	for _, ledgerEntry := range walletDetailsModel.LedgerEntries {
		ledgerEntries = append(ledgerEntries, ToWalletLedgerDetailsResponse(&ledgerEntry))
	}

	walletTypeDetails := dto.WalletTypeDetailsResponseDTO{
		ID: walletDetailsModel.TypeID,
		Name: walletDetailsModel.Type.Name,
	}

	fmt.Printf("userDetails: %+v\n", walletDetailsModel.User)

	userDetails := helper.UserResponseDTO{
		ID: walletDetailsModel.User.ID.String(),
		FirstName: walletDetailsModel.User.FirstName,
		LastName: walletDetailsModel.User.LastName,
		Email: walletDetailsModel.User.Email,
		ProfilePictureURL: walletDetailsModel.User.ProfilePictureURL,
	}

	return dto.WalletDetailsResponseDTO{
		ID: walletDetailsModel.ID,
		Name: walletDetailsModel.Name,
		Description: walletDetailsModel.Description,
		Currency: walletDetailsModel.Currency,
		TypeID: walletDetailsModel.TypeID,
		WorkspaceID: walletDetailsModel.WorkspaceID,
		CreatedBy: walletDetailsModel.CreatedBy,
		CreatedAt: walletDetailsModel.CreatedAt,
		Type: walletTypeDetails,
		User: userDetails,
		LedgerEntries: ledgerEntries,
	}
}

