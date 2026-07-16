package mapper

import (
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

