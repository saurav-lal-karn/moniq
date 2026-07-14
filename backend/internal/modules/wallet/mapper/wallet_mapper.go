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