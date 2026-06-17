"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { toast } from "react-hot-toast";

interface SocketContextType {
    isConnected: boolean;
    lastMessage: any;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { user, token: authContextToken } = useAuth();
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any>(null);

    useEffect(() => {
        // Only connect if user is logged in
        // We assume the token is stored in a cookie which is sent automatically,
        // or we pass it via query param if needed.
        // Since we added query param support in backend, let's use it.

        // 1. Get token from AuthContext or fallback to sessionStorage
        // document.cookie won't work if HttpOnly
        const token = authContextToken || sessionStorage.getItem("ws_token");

        if (user && token && !socket) {
            const protocol =
                window.location.protocol === "https:" ? "wss:" : "ws:";
            const host = "localhost:3080"; // In production, use env variable
            const wsUrl = `${protocol}//${host}/api/ws?token=${token}`;

            console.log("Connecting to WebSocket...");
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("WebSocket Connected");
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setLastMessage(data);

                // Global toast for any incoming notification
                if (data.title && data.message) {
                    const isProgress = data.type === "TASK_PROGRESS";
                    const isComplete = data.type === "TASK_COMPLETE";

                    toast(data.message, {
                        icon: isComplete ? "✅" : isProgress ? "⌛" : "🔔",
                        duration: isComplete ? 5000 : 3000,
                        style: {
                            borderRadius: "16px",
                            background: "#fff",
                            color: "#1f2937",
                            fontWeight: "600",
                            fontSize: "14px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        },
                    });
                }
            };

            ws.onclose = () => {
                console.log("WebSocket Disconnected");
                setIsConnected(false);
                // Add a delay before allowing reconnection to avoid spamming
                setTimeout(() => {
                    setSocket(null);
                }, 3000);
            };

            ws.onerror = (error) => {
                console.error("WebSocket Error:", error);
            };

            setSocket(ws);
        }

        return () => {
            if (socket) {
                socket.onclose = null; // Prevent state update on unmount
                socket.close();
            }
        };
    }, [user, socket, authContextToken]);

    return (
        <SocketContext.Provider value={{ isConnected, lastMessage }}>
            {children}
        </SocketContext.Provider>
    );
};
