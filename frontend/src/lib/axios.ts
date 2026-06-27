import axios from "axios";

// Create an Axios instance
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "/api", // Adjust if needed
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor (optional if only using cookies, but good for debugging or hybrid)
apiClient.interceptors.request.use(
    (config) => {
        // Ensure cookies are sent
        config.withCredentials = true;

        // Inject active workspace ID if available
        if (typeof window !== "undefined") {
            const workspaceId = sessionStorage.getItem("active_workspace_id");
            if (workspaceId) {
                config.headers["X-Workspace-ID"] = workspaceId;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized (e.g., redirect to login)
        if (error.response && error.response.status === 401) {
            // Logic to redirect to login or refresh token
            if (typeof window !== "undefined") {
                // window.location.href = "/signin"; // Optional: Force redirect
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
