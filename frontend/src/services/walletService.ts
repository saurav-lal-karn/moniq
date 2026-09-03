import { apiFetch } from "@/lib/api";

export interface Wallet {
    id: string;
    name: string;
    description?: string;
    workspace_id: string;
    created_by: string;
    type_id: string;
    currency: string;
}

export interface WalletType {
    id: string;
    name: string;
    description?: string;
    workspace_id?: string;
    created_by?: string;
}

export interface CreateWalletPayload {
    name: string;
    type_id: string;
    currency: string;
    description?: string;
}

export interface UpdateWalletPayload {
    id: string;
    name: string;
    type_id: string;
    currency: string;
    description?: string;
}

export interface CreateWalletTypePayload {
    name: string;
    description?: string;
}

export const walletService = {
    listWallets: async (): Promise<Wallet[]> => {
        return await apiFetch<Wallet[]>("/wallet");
    },
    getWallet: async (id: string): Promise<Wallet> => {
        return await apiFetch<Wallet>(`/wallet/${id}`);
    },
    createWallet: async (payload: CreateWalletPayload): Promise<void> => {
        await apiFetch<void>("/wallet", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
    updateWallet: async (id: string, payload: UpdateWalletPayload): Promise<void> => {
        await apiFetch<void>(`/wallet/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    },
    deleteWallet: async (id: string): Promise<void> => {
        await apiFetch<void>(`/wallet/${id}`, {
            method: "DELETE",
        });
    },
    listWalletTypes: async (): Promise<WalletType[]> => {
        return await apiFetch<WalletType[]>("/wallet-type");
    },
    createWalletType: async (payload: CreateWalletTypePayload): Promise<void> => {
        await apiFetch<void>("/wallet-type", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
};
