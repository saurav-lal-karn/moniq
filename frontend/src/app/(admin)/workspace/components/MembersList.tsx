"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { workspaceService } from "@/services/workspaceService";
import { useWorkspace } from "@/context/WorkspaceContext";
import { WorkspaceMemberResponse } from "@/types";
import { SkeletonTable } from "@/components/ui/skeleton";

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

    return (
        <div className="rounded-xl border border-border bg-surface shadow-theme-xs">
            <div className="p-6">
                <h3 className="text-lg font-bold text-foreground">Workspace Members</h3>
                <p className="mt-1 text-sm text-foreground-muted">People who have access to this workspace.</p>
            </div>

            <div className="overflow-x-auto">
                {
                    loading ? <SkeletonTable rows={4} columns={4} /> :
                        (
                            <Table className="w-full text-left text-sm text-foreground-muted">
                                <TableHeader className="bg-surface-secondary text-xs uppercase text-foreground-muted">
                                    <TableRow>
                                        <TableCell isHeader className="px-6 py-3 font-semibold">User</TableCell>
                                        <TableCell isHeader className="px-6 py-3 font-semibold">Email</TableCell>
                                        <TableCell isHeader className="px-6 py-3 font-semibold">Role</TableCell>
                                        <TableCell isHeader className="px-6 py-3 font-semibold">Joined</TableCell>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {members.length === 0 ? (
                                        <TableRow>
                                            <TableCell className="px-6 py-4 text-center" colSpan={4}>No members found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        members.map((member) => (
                                            <TableRow key={member.id} className="border-b border-border bg-surface hover:bg-surface-secondary/50">
                                                <TableCell className="px-6 py-4 font-medium text-foreground">
                                                    <div className="flex items-center gap-3">
                                                        {member.user?.profile_picture_url ? (
                                                            <Image src={member.user.profile_picture_url} alt="Profile" width={32} height={32} className="h-8 w-8 rounded-full object-cover" unoptimized />
                                                        ) : (
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary font-bold text-xs">
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
                        )
                }

            </div>


        </div>
    );
}
