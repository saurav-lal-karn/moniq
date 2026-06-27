"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Workspace } from "@/types";
import { workspaceService } from "@/services/workspaceService";
import { useAuth } from "./AuthContext";

interface WorkspaceContextType {
    workspaces: Workspace[];
    activeWorkspace: Workspace | null;
    loading: boolean;
    setActiveWorkspace: (workspace: Workspace) => void;
    refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
    const [loading, setLoading] = useState(false);

    const refreshWorkspaces = async () => {
        if (!isAuthenticated) {
            setWorkspaces([]);
            setActiveWorkspaceState(null);
            return;
        }
        
        try {
            setLoading(true);
            const data = await workspaceService.listMyWorkspaces();
            setWorkspaces(data || []);
            
            // Check session storage for previously selected workspace
            const savedWorkspaceId = sessionStorage.getItem("active_workspace_id");
            if (data && data.length > 0) {
                if (savedWorkspaceId) {
                    const found = data.find((w) => w.id === savedWorkspaceId);
                    setActiveWorkspaceState(found || data[0]);
                } else {
                    setActiveWorkspaceState(data[0]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch workspaces", error);
            setWorkspaces([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshWorkspaces();
    }, [isAuthenticated]);

    const setActiveWorkspace = (workspace: Workspace) => {
        setActiveWorkspaceState(workspace);
        sessionStorage.setItem("active_workspace_id", workspace.id);
    };

    return (
        <WorkspaceContext.Provider
            value={{
                workspaces,
                activeWorkspace,
                loading,
                setActiveWorkspace,
                refreshWorkspaces,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error("useWorkspace must be used within a WorkspaceProvider");
    }
    return context;
}
