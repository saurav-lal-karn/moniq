"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { workspaceService } from "@/services/workspaceService";
import { useWorkspace } from "@/context/WorkspaceContext";
import { InvitationResponseDTO } from "@/types";
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import InviteMembersDialog from "./InviteMembersDialog";
import toast from "react-hot-toast";

export default function InvitationsList() {
    const { activeWorkspace } = useWorkspace();
    const [invitations, setInvitations] = useState<InvitationResponseDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const handleResend = async (invitationId: string) => {
        await workspaceService.ResendInvitation(invitationId);
        getInvitations();
    };

    const handleRemove = async (invitationId: string) => {
        await workspaceService.RemoveInvitation(invitationId);
        getInvitations();
    };

    const getInvitations = async () => {
        setLoading(true);
        try {
            const data = await workspaceService.listInvitations();
            setInvitations(data);
        } catch (error) {
            console.error("Failed to load invitations:", error);
        } finally {
            setLoading(false);
        }
    }

    const inviteUser = async ({ email, role }: { email: string, role: string }) => {
        try {
            await workspaceService.InviteUser(email, role);
            toast.success("User invited successfully")
            getInvitations()
            setIsOpen(false)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to invite user";
            toast.error(message);
        }
    }

    useEffect(() => {
        async function fetchInvitations() {
            if (!activeWorkspace?.id) return;
            getInvitations()
        }
        fetchInvitations();
    }, [activeWorkspace?.id]);

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
            <div className="grid grid-cols-12 items-center py-2">
                <div className="col-span-6">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pending Invitations</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Invitations sent to users to join this workspace.</p>
                    </div>
                </div>
                <div className="col-span-6 flex justify-end">
                    <Button onClick={() => setIsOpen(true)} className="mr-4">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Members
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                {
                    loading ? <SkeletonTable rows={4} columns={4} />
                        : (
                            <Table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                <TableHeader className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                    <TableRow>
                                        <TableCell isHeader className="px-6 py-3">Email</TableCell>
                                        <TableCell isHeader className="px-6 py-3">Role</TableCell>
                                        <TableCell isHeader className="px-6 py-3">Status</TableCell>
                                        <TableCell isHeader className="px-6 py-3">Expires</TableCell>
                                        <TableCell isHeader className="px-6 py-3">Actions</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invitations.length === 0 ? (
                                        <TableRow>
                                            <TableCell className="px-6 py-4 text-center" colSpan={4}>No pending invitations.</TableCell>
                                        </TableRow>
                                    ) : (
                                        invitations.map((invitation) => (
                                            <TableRow key={invitation.id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:bg-gray-800/50">
                                                <TableCell className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    {invitation.email}
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                        {invitation.role}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${invitation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                        {invitation.status}
                                                    </span>
                                                    {
                                                        new Date(invitation.expires_at) < new Date() && (
                                                            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                                                                Expired
                                                            </span>
                                                        )
                                                    }
                                                </TableCell>
                                                <TableCell className="px-6 py-4">{new Date(invitation.expires_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    {
                                                        new Date(invitation.expires_at) < new Date() && (
                                                            <button
                                                                onClick={() => {
                                                                    handleResend(invitation.id);
                                                                }}
                                                                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-gray-800"
                                                            >
                                                                Resend
                                                            </button>
                                                        )
                                                    }
                                                    <button
                                                        onClick={() => {
                                                            handleRemove(invitation.id);
                                                        }}
                                                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-gray-800"
                                                    >
                                                        Remove
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )
                }

            </div>
            <InviteMembersDialog isOpen={isOpen} onClose={() => setIsOpen(false)} onSubmit={inviteUser} />
        </div>
    );
}
