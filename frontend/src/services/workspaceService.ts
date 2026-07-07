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
            const data = await apiFetch<InvitationResponseDTO[]>("/invite");
            return data;
        } catch (error) {
            console.error("Failed to list invitations", error);
            return []; // Stub behavior or fallback
        }
    },
    InviteUser: async (email: string, role: string): Promise<void> => {
        await apiFetch<void>(`/invite`, {
            method: "POST",
            body: JSON.stringify({ email, role }),
        });
    },
    ResendInvitation: async (invitationId: string): Promise<void> => {
        await apiFetch<void>('/invite/resend', {
            method: "POST",
            body: JSON.stringify({ id: invitationId })
        });
    },
    RemoveInvitation: async (invitationId: string): Promise<void> => {
        await apiFetch<void>('/invite/remove', {
            method: "POST",
            body: JSON.stringify({ id: invitationId })
        });
    },
    RemokeInvitation: async (invitationId: string): Promise<void> => {
        await apiFetch<void>('/invite/revoke', {
            method: "POST",
            body: JSON.stringify({ id: invitationId })
        });
    },
    DeclineInvitation: async (token: string): Promise<void> => {
        await apiFetch<void>("/invitation/decline", {
            method: "POST",
            body: JSON.stringify({ token }),
        });
    },
    AcceptInvitation: async (token: string): Promise<void> => {
        await apiFetch<void>("/invitation/accept", {
            method: "POST",
            body: JSON.stringify({ token }),
        });
    }
};
