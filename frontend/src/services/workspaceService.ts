import { apiFetch } from "@/lib/api";
import { Workspace, WorkspaceMemberResponse, InvitationResponseDTO } from "@/types";

export const workspaceService = {
    listMyWorkspaces: async (): Promise<Workspace[]> => {
        const data = await apiFetch<Workspace[]>("/workspace/list");
        return data;
    },
    listMembers: async (): Promise<WorkspaceMemberResponse[]> => {
        try {
            const data = await apiFetch<WorkspaceMemberResponse[]>("/workspace/member");
            return data;
        } catch (error) {
            console.error("Failed to list members", error);
            return []; // Stub behavior or fallback
        }
    },
    listInvitations: async (): Promise<InvitationResponseDTO[]> => {
        try {
            const data = await apiFetch<InvitationResponseDTO[]>("/workspace/invite");
            return data;
        } catch (error) {
            console.error("Failed to list invitations", error);
            return []; // Stub behavior or fallback
        }
    },
    InviteUser: async (email: string, role: string): Promise<void> => {
        await apiFetch<void>(`/workspace/invite`, {
            method: "POST",
            body: JSON.stringify({ email, role }),
        });
    },
    ResendInvitation: async (invitationId: string): Promise<void> => {
        await apiFetch<void>(`/workspace/invite/resend/${invitationId}`, {
            method: "POST",
        });
    },
    RemoveInvitation: async (invitationId: string): Promise<void> => {
        await apiFetch<void>(`/workspace/invite/remove/${invitationId}`, {
            method: "POST",
        });
    },
    DeclineInvitation: async (): Promise<void> => {
        await apiFetch<void>("/workspace/invite/decline", {
            method: "POST",
        });
    },
    AcceptInvitation: async (): Promise<void> => {
        await apiFetch<void>("/workspace/invite/accept", {
            method: "POST",
        });
    }
};
