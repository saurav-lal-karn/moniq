package handler

import "github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/service"

type walletHandler struct {
	walletService service.WalletService
}