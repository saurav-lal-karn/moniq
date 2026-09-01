import { apiFetch } from "@/lib/api";

export interface TransactionItem {
    id?: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

export interface TransactionTag {
    id?: string;
    name: string;
}

export interface TransactionResponse {
    id: string;
    amount: number;
    date: string;
    description?: string;
    type: string; // "expense" | "income" | "transfer-in" | "transfer-out" | "investment" | "other"
    wallet_id: string;
    destination_wallet_id?: string;
    contact_id?: string;
    items: TransactionItem[];
    tags: (string | TransactionTag)[];
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: "asc" | "desc" | string;
}

export interface PaginatedResult<T> {
    items: T[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

export interface CreateTransactionRequest {
    amount: number;
    date: string; // "YYYY-MM-DD"
    description?: string;
    type: string;
    wallet_id: string;
    destination_wallet_id?: string;
    contact_id?: string;
    items: TransactionItem[];
    tags?: string[];
}

export interface ContactResponse {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    type: string; // "lender" | "employee" | "client" | "vendor" | "other"
    workspace_id: string;
    created_by: string;
}

export interface CreateContactRequest {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    type: string;
}

export interface UpdateContactRequest {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    type: string;
}

export interface TagResponse {
    id: string;
    name: string;
    workspace_id?: string;
    created_by?: string;
}

export interface CreateTagRequest {
    name: string;
}

export const transactionService = {
    listTransactions: async (params?: PaginationParams): Promise<PaginatedResult<TransactionResponse>> => {
        const searchParams = new URLSearchParams();
        if (params?.page !== undefined) searchParams.append("page", params.page.toString());
        if (params?.limit !== undefined) searchParams.append("limit", params.limit.toString());
        if (params?.search) searchParams.append("search", params.search);
        if (params?.sort) searchParams.append("sort", params.sort);
        if (params?.order) searchParams.append("order", params.order);

        const queryString = searchParams.toString();
        const endpoint = `/transaction/${queryString ? `?${queryString}` : ""}`;
        return await apiFetch<PaginatedResult<TransactionResponse>>(endpoint);
    },
    createTransaction: async (payload: CreateTransactionRequest): Promise<void> => {
        await apiFetch<void>("/transaction/", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
};

export const contactService = {
    listContacts: async (): Promise<ContactResponse[]> => {
        return await apiFetch<ContactResponse[]>("/contact");
    },
    getContactById: async (id: string): Promise<ContactResponse> => {
        return await apiFetch<ContactResponse>(`/contact/${id}`);
    },
    createContact: async (payload: CreateContactRequest): Promise<void> => {
        await apiFetch<void>("/contact", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
    updateContact: async (id: string, payload: UpdateContactRequest): Promise<void> => {
        await apiFetch<void>(`/contact/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    },
    deleteContact: async (id: string): Promise<void> => {
        await apiFetch<void>(`/contact/${id}`, {
            method: "DELETE",
        });
    },
};

export const tagService = {
    listTags: async (): Promise<TagResponse[]> => {
        return await apiFetch<TagResponse[]>("/tag");
    },
    createTag: async (payload: CreateTagRequest): Promise<void> => {
        await apiFetch<void>("/tag", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
    updateTag: async (id: string, payload: CreateTagRequest): Promise<void> => {
        await apiFetch<void>(`/tag/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    },
    deleteTag: async (id: string): Promise<void> => {
        await apiFetch<void>(`/tag/${id}`, {
            method: "DELETE",
        });
    },
};
