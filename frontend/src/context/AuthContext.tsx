"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Family } from "@/types";

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    user_name: string;
    phone_number: string;
    country: string;
    avatar_url: string;
    theme: string;
    locale: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    family: Family;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    token: string | null;
    login: (credentials: Record<string, unknown>, callbackUrl?: string) => Promise<void>;
    signup: (userData: Record<string, unknown>, callbackUrl?: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkAuth = async () => {
        try {
            setLoading(true);
            const userData = await apiFetch<User>("/auth/me");
            setUser(userData);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
        const savedToken = sessionStorage.getItem("ws_token");
        if (savedToken) setToken(savedToken);
    }, []);

    const login = async (credentials: Record<string, unknown>, callbackUrl?: string) => {
        const data = await apiFetch<{ access_token: string }>("/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        });
        if (data.access_token) {
            setToken(data.access_token);
            // Also store in sessionStorage for persistence across reloads (non-HttpOnly token used for WS)
            sessionStorage.setItem("ws_token", data.access_token);
        }
        await checkAuth();
        router.push(callbackUrl || "/dashboard");
    };

    const signup = async (userData: Record<string, unknown>, callbackUrl?: string) => {
        await apiFetch("/auth/register", {
            method: "POST",
            body: JSON.stringify(userData),
        });
        // Assuming register also logs in or we redirect to signin
        if (callbackUrl) {
            router.push(`/signin?callback=${encodeURIComponent(callbackUrl)}`);
        } else {
            router.push("/signin");
        }
    };

    const logout = async () => {
        try {
            // Backend logout might require refresh token in body if not in cookie
            // For now, let's assume it clears cookies
            await apiFetch("/auth/logout", { method: "POST" });
        } finally {
            setUser(null);
            setToken(null);
            sessionStorage.removeItem("ws_token");
            router.push("/signin");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                token,
                login,
                signup,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
