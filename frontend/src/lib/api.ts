const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3080/api";

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
    error?: string;
};

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    // Default headers
    options.headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // Inject active workspace ID and Auth token if available
    if (typeof window !== "undefined") {
        const workspaceId = sessionStorage.getItem("active_workspace_id");
        if (workspaceId) {
            options.headers = {
                ...options.headers,
                "X-Workspace-Id": workspaceId,
            };
        }

        const token = sessionStorage.getItem("ws_token");
        if (token) {
            options.headers = {
                ...options.headers,
                "Authorization": `Bearer ${token}`,
            };
        }
    }

    // Ensure credentials for cookies
    options.credentials = "include";

    const response = await fetch(url, options);
    const result: ApiResponse<T> = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || "An error occurred");
    }

    return result.data;
}
