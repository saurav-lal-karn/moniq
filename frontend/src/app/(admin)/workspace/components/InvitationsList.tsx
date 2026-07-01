"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { workspaceService } from "@/services/workspaceService";
import { useWorkspace } from "@/context/WorkspaceContext";
import { InvitationResponseDTO } from "@/types";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, MoreHorizontal, RefreshCw, ShieldOff, Trash2, UserPlus } from "lucide-react";
import InviteMembersDialog from "./InviteMembersDialog";
import toast from "react-hot-toast";

// ─── helpers ───────────────────────────────────────────────────────────────

interface GroupedInvitation {
    email: string;
    invitations: InvitationResponseDTO[];
    /** true if at least one invitation is still pending */
    hasPending: boolean;
    /** the most-recent invitation (for summary display) */
    latest: InvitationResponseDTO;
}

function groupByEmail(invitations: InvitationResponseDTO[]): GroupedInvitation[] {
    const map = new Map<string, InvitationResponseDTO[]>();
    for (const inv of invitations) {
        if (!map.has(inv.email)) map.set(inv.email, []);
        map.get(inv.email)!.push(inv);
    }

    return Array.from(map.entries()).map(([email, list]) => {
        // sort newest first
        const sorted = [...list].sort(
            (a, b) => new Date(b.expires_at).getTime() - new Date(a.expires_at).getTime()
        );
        return {
            email,
            invitations: sorted,
            hasPending: sorted.some((i) => i.status === "pending"),
            latest: sorted[0],
        };
    });
}

function isExpired(inv: InvitationResponseDTO) {
    return new Date(inv.expires_at) < new Date();
}

// ─── status badge ──────────────────────────────────────────────────────────

function StatusBadge({ invitation }: { invitation: InvitationResponseDTO }) {
    const expired = isExpired(invitation);
    return (
        <span className="inline-flex items-center gap-1.5 flex-wrap">
            <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${invitation.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    : invitation.status === "accepted"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
            >
                {invitation.status}
            </span>
            {expired && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                    Expired
                </span>
            )}
        </span>
    );
}

// ─── summary badge (for collapsed row) ────────────────────────────────────

function SummaryStatusBadge({ group }: { group: GroupedInvitation }) {
    const pendingCount = group.invitations.filter((i) => i.status === "pending").length;
    const acceptedCount = group.invitations.filter((i) => i.status === "accepted").length;
    return (
        <span className="inline-flex items-center gap-1.5 flex-wrap">
            {pendingCount > 0 && (
                <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    {pendingCount} pending
                </span>
            )}
            {acceptedCount > 0 && (
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                    {acceptedCount} accepted
                </span>
            )}
        </span>
    );
}

// ─── actions dropdown ──────────────────────────────────────────────────────

function InvitationActions({
    invitation,
    onResend,
    onRevoke,
    onRemove,
}: {
    invitation: InvitationResponseDTO;
    onResend: (id: string) => void;
    onRevoke: (id: string) => void;
    onRemove: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const expired = isExpired(invitation);
    const isPending = invitation.status === "pending";

    // close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const items = [
        {
            key: "resend",
            label: "Resend",
            icon: <RefreshCw className="h-3.5 w-3.5" />,
            visible: expired,
            danger: false,
            action: () => { onResend(invitation.id); setOpen(false); },
        },
        {
            key: "revoke",
            label: "Revoke",
            icon: <ShieldOff className="h-3.5 w-3.5" />,
            visible: isPending,
            danger: true,
            action: () => { onRevoke(invitation.id); setOpen(false); },
        },
        {
            key: "remove",
            label: "Remove",
            icon: <Trash2 className="h-3.5 w-3.5" />,
            visible: true,
            danger: true,
            action: () => { onRemove(invitation.id); setOpen(false); },
        },
    ].filter((item) => item.visible);

    if (items.length === 0) return null;

    return (
        <div ref={ref} className="relative inline-block">
            <button
                onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
                aria-label="Actions"
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-1.5 w-40 rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    {items.map((item) => (
                        <button
                            key={item.key}
                            onClick={(e) => { e.stopPropagation(); item.action(); }}
                            className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition-colors ${item.danger
                                    ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── expanded sub-rows ─────────────────────────────────────────────────────

function ExpandedInvitations({
    invitations,
    onResend,
    onRevoke,
    onRemove,
}: {
    invitations: InvitationResponseDTO[];
    onResend: (id: string) => void;
    onRevoke: (id: string) => void;
    onRemove: (id: string) => void;
}) {
    return (
        <>
            {invitations.map((inv, idx) => (
                <TableRow
                    key={inv.id}
                    className="bg-gray-50/70 dark:bg-gray-800/40 border-b border-dashed border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-1 duration-200"
                    style={{ animationDelay: `${idx * 30}ms` }}
                >
                    {/* indent spacer */}
                    <TableCell className="px-6 py-3 w-10">
                        <span className="block w-3 border-l-2 border-b-2 border-gray-300 dark:border-gray-600 rounded-bl-sm h-3 ml-2" />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        Invitation #{idx + 1}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {inv.role}
                        </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                        <StatusBadge invitation={inv} />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(inv.expires_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                        <InvitationActions
                            invitation={inv}
                            onResend={onResend}
                            onRevoke={onRevoke}
                            onRemove={onRemove}
                        />
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
}

// ─── main component ────────────────────────────────────────────────────────

export default function InvitationsList() {
    const { activeWorkspace } = useWorkspace();
    const [invitations, setInvitations] = useState<InvitationResponseDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());

    const grouped = useMemo(() => groupByEmail(invitations), [invitations]);

    const toggleExpand = (email: string) => {
        setExpandedEmails((prev) => {
            const next = new Set(prev);
            if (next.has(email)) {
                next.delete(email);
            } else {
                next.add(email);
            }
            return next;
        });
    };

    const handleResend = async (invitationId: string) => {
        try {
            await workspaceService.ResendInvitation(invitationId);
            toast.success("Invitation resent successfully");
            getInvitations();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to resend invitation";
            toast.error(message);
        }
    };

    const handleRevoke = async (invitationId: string) => {
        try {
            await workspaceService.RemoveInvitation(invitationId);
            toast.success("Invitation revoked");
            getInvitations();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to revoke invitation";
            toast.error(message);
        }
    };

    const handleRemove = async (invitationId: string) => {
        try {
            await workspaceService.RemoveInvitation(invitationId);
            toast.success("Invitation removed");
            getInvitations();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to remove invitation";
            toast.error(message);
        }
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
    };

    const inviteUser = async ({ email, role }: { email: string; role: string }) => {
        try {
            await workspaceService.InviteUser(email, role);
            toast.success("User invited successfully");
            getInvitations();
            setIsOpen(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to invite user";
            toast.error(message);
        }
    };

    useEffect(() => {
        if (!activeWorkspace?.id) return;
        getInvitations();
    }, [activeWorkspace?.id]);

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
            {/* header */}
            <div className="grid grid-cols-12 items-center py-2">
                <div className="col-span-6">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Pending Invitations
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Invitations sent to users to join this workspace.
                        </p>
                    </div>
                </div>
                <div className="col-span-6 flex justify-end">
                    <Button onClick={() => setIsOpen(true)} className="mr-4">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Members
                    </Button>
                </div>
            </div>

            {/* table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <SkeletonTable rows={4} columns={5} />
                ) : (
                    <Table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <TableHeader className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                            <TableRow>
                                {/* expand toggle column */}
                                <TableCell isHeader className="w-10 px-4 py-3" >#</TableCell>
                                <TableCell isHeader className="px-6 py-3">
                                    Email
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3">
                                    Role
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3">
                                    Status
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3">
                                    Latest Expiry
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {grouped.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        className="px-6 py-4 text-center"
                                        colSpan={6}
                                    >
                                        No pending invitations.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                grouped.map((group) => {
                                    const isExpanded = expandedEmails.has(group.email);
                                    const hasMultiple = group.invitations.length > 1;

                                    return (
                                        <React.Fragment key={group.email}>
                                            {/* ── grouped summary row ── */}
                                            <TableRow
                                                className={`border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:bg-gray-800/50 ${hasMultiple ? "cursor-pointer select-none" : ""
                                                    }`}
                                                onClick={
                                                    hasMultiple
                                                        ? () => toggleExpand(group.email)
                                                        : undefined
                                                }
                                            >
                                                {/* expand icon */}
                                                <TableCell className="w-10 px-4 py-4">
                                                    {hasMultiple && (
                                                        <span className="flex items-center justify-center text-gray-400 dark:text-gray-500">
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </span>
                                                    )}
                                                </TableCell>

                                                {/* email + count badge */}
                                                <TableCell className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    <span className="flex items-center gap-2">
                                                        {group.email}
                                                        {hasMultiple && (
                                                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                                                                {group.invitations.length} invites
                                                            </span>
                                                        )}
                                                    </span>
                                                </TableCell>

                                                {/* role of latest invite */}
                                                <TableCell className="px-6 py-4">
                                                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                        {group.latest.role}
                                                    </span>
                                                </TableCell>

                                                {/* aggregated status */}
                                                <TableCell className="px-6 py-4">
                                                    {hasMultiple ? (
                                                        <SummaryStatusBadge group={group} />
                                                    ) : (
                                                        <StatusBadge invitation={group.latest} />
                                                    )}
                                                </TableCell>

                                                {/* latest expiry */}
                                                <TableCell className="px-6 py-4">
                                                    {new Date(
                                                        group.latest.expires_at
                                                    ).toLocaleDateString()}
                                                </TableCell>

                                                {/* actions for latest — only when single or collapsed */}
                                                <TableCell
                                                    className="px-6 py-4"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {!hasMultiple && (
                                                        <InvitationActions
                                                            invitation={group.latest}
                                                            onResend={handleResend}
                                                            onRevoke={handleRevoke}
                                                            onRemove={handleRemove}
                                                        />
                                                    )}
                                                    {hasMultiple && !isExpanded && (
                                                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                                                            Expand to manage
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>

                                            {/* ── expanded child rows ── */}
                                            {isExpanded && (
                                                <ExpandedInvitations
                                                    invitations={group.invitations}
                                                    onResend={handleResend}
                                                    onRevoke={handleRevoke}
                                                    onRemove={handleRemove}
                                                />
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            <InviteMembersDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={inviteUser}
            />
        </div>
    );
}
