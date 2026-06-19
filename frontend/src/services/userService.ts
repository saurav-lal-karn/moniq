import apiClient from "@/lib/axios";

export interface UpdateUserPayload {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
}

export const userService = {
    updateMe: async (data: UpdateUserPayload) => {
        const response = await apiClient.put("/auth/me", data);
        return response.data;
    },
    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append("avatar", file);
        const response = await apiClient.post("/auth/me/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    // Add other user-related methods here
};
