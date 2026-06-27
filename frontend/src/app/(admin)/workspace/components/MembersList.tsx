"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { workspaceService } from "@/services/workspaceService";
import { useWorkspace } from "@/context/WorkspaceContext";
import { WorkspaceMemberResponse } from "@/types";
import { Badge } from "@/components/ui/badge"; // Let's check if badge exists later, or just use standard div. Let's just use standard div with classes for now.

export default function MembersList() {
    const { activeWorkspace } = useWorkspace();
    const [members, setMembers] = useState<WorkspaceMemberResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMembers() {
            if (!activeWorkspace?.id) return;
            setLoading(true);
            try {
                const data = await workspaceService.listMembers();
                setMembers(data);
            } catch (error) {
                console.error("Failed to load members:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMembers();
    }, [activeWorkspace?.id]);

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Loading members...</div>;
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
            <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Workspace Members</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">People who have access to this workspace.</p>
            </div>

            <div className="overflow-x-auto">
                <Table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <TableHeader className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                        <TableRow>
                            <TableCell isHeader className="px-6 py-3">User</TableCell>
                            <TableCell isHeader className="px-6 py-3">Email</TableCell>
                            <TableCell isHeader className="px-6 py-3">Role</TableCell>
                            <TableCell isHeader className="px-6 py-3">Joined</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.length === 0 ? (
                            <TableRow>
                                <TableCell className="px-6 py-4 text-center" colSpan={4}>No members found.</TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => (
                                <TableRow key={member.id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:bg-gray-800/50">
                                    <TableCell className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-3">
                                            {member.user?.profile_picture_url ? (
                                                <img src={member.user.profile_picture_url} alt="Profile" className="h-8 w-8 rounded-full" />
                                            ) : (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                                    {member.user?.first_name?.charAt(0) || "U"}
                                                </div>
                                            )}
                                            {member.user?.first_name} {member.user?.last_name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">{member.user?.email}</TableCell>
                                    <TableCell className="px-6 py-4">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${member.role === 'OWNER' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                            {member.role}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">{new Date(member.joined_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
