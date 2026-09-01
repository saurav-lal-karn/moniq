"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
    transactionService,
    contactService,
    TransactionResponse,
    ContactResponse,
} from "@/services/transactionService";
import { walletService, Wallet } from "@/services/walletService";
import { EditTransactionModal } from "@/components/transaction/EditTransactionModal";
import { DeleteTransactionDialog } from "@/components/transaction/DeleteTransactionDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/context/WorkspaceContext";
import { toast } from "react-hot-toast";
import {
    ArrowLeft,
    Receipt,
    Calendar,
    Wallet as WalletIcon,
    Building2,
    Tag as TagIcon,
    ArrowUpRight,
    ArrowDownLeft,
    ArrowRightLeft,
    Edit,
    Trash2,
    Clock,
    UserCheck,
    CreditCard,
    DollarSign,
} from "lucide-react";

export default function TransactionDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const transactionId = params?.id as string;
    const { activeWorkspace } = useWorkspace();

    const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [contacts, setContacts] = useState<ContactResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal & Dialog states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const fetchDetails = useCallback(async () => {
        if (!activeWorkspace || !transactionId) return;
        setLoading(true);
        try {
            const [txData, walletData, contactData] = await Promise.all([
                transactionService.getTransactionById(transactionId),
                walletService.listWallets(),
                contactService.listContacts(),
            ]);
            setTransaction(txData);
            setWallets(walletData || []);
            setContacts(contactData || []);
        } catch (err: unknown) {
            console.error("Failed to load transaction details", err);
            toast.error("Failed to fetch transaction details.");
        } finally {
            setLoading(false);
        }
    }, [activeWorkspace, transactionId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const getWalletName = (wId?: string) => {
        if (!wId) return "Unknown Wallet";
        const found = wallets.find((w) => w.id === wId);
        return found ? `${found.name} (${found.currency})` : "Unknown Wallet";
    };

    const getContactName = (cId?: string) => {
        if (!cId) return null;
        const found = contacts.find((c) => c.id === cId);
        return found ? `${found.name} (${found.type})` : null;
    };

    const getTypeBadge = (type: string) => {
        switch (type.toLowerCase()) {
            case "income":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <ArrowDownLeft className="h-4 w-4" /> Income
                    </span>
                );
            case "expense":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                        <ArrowUpRight className="h-4 w-4" /> Expense
                    </span>
                );
            case "transfer-in":
            case "transfer-out":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <ArrowRightLeft className="h-4 w-4" /> Transfer
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/10 px-3 py-1 text-xs font-bold text-gray-600 dark:text-gray-400 capitalize">
                        {type}
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto p-4 animate-pulse">
                <Skeleton className="h-6 w-40 rounded-md" />
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-64 rounded-xl" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24 rounded-xl" />
                        <Skeleton className="h-10 w-24 rounded-xl" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                </div>
                <Skeleton className="h-64 rounded-2xl" />
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4">
                    <Receipt className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Transaction Not Found</h2>
                <p className="mt-1 text-sm text-foreground-muted">
                    The requested transaction record could not be found or has been removed.
                </p>
                <Link
                    href="/transaction"
                    className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary-hover transition-all"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Transactions
                </Link>
            </div>
        );
    }

    const contactName = getContactName(transaction.contact_id);
    const walletName = getWalletName(transaction.wallet_id);

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
            {/* Back link */}
            <div>
                <Link
                    href="/transaction"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="h-4 w-4 text-primary group-hover:-translate-x-1 transition-transform" />
                    Back to Transactions Listing
                </Link>
            </div>

            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
                <div>
                    <div className="flex items-center gap-3">
                        {getTypeBadge(transaction.type)}
                        <span className="text-xs font-mono text-foreground-muted">ID: {transaction.id}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">
                        {transaction.description || "Transaction Details"}
                    </h1>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-secondary transition-all shadow-xs"
                    >
                        <Edit className="h-4 w-4 text-primary" /> Edit
                    </button>
                    <button
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all shadow-xs"
                    >
                        <Trash2 className="h-4 w-4" /> Delete
                    </button>
                </div>
            </div>

            {/* Overview Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Amount Card */}
                <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Total Amount</span>
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </div>
                    <p
                        className={`text-2xl font-extrabold mt-3 ${
                            transaction.type === "income"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : transaction.type === "expense"
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-foreground"
                        }`}
                    >
                        {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}
                        ${transaction.amount.toFixed(2)}
                    </p>
                </div>

                {/* Date Card */}
                <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Transaction Date</span>
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Calendar className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-base font-bold text-foreground mt-3">
                        {new Date(transaction.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </p>
                </div>

                {/* Wallet Card */}
                <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Source Wallet</span>
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <WalletIcon className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-base font-bold text-foreground mt-3 truncate">{walletName}</p>
                </div>

                {/* Contact Card */}
                <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Contact / Vendor</span>
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Building2 className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-base font-bold text-foreground mt-3 truncate">
                        {contactName || "—"}
                    </p>
                </div>
            </div>

            {/* Tags Strip */}
            {transaction.tags && transaction.tags.length > 0 && (
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-4 shadow-xs">
                    <TagIcon className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Associated Tags:</span>
                    <div className="flex flex-wrap gap-1.5 ml-2">
                        {transaction.tags.map((t, idx) => {
                            const tagName = typeof t === "string" ? t : t.name;
                            const tagKey = typeof t === "string" ? t : t.id || idx;
                            return (
                                <span
                                    key={tagKey}
                                    className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-lg"
                                >
                                    #{tagName}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Line Items Breakdown Table */}
            <div className="rounded-2xl border border-border bg-surface shadow-xs overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-secondary/40">
                    <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-primary" />
                        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Line Items Breakdown</h3>
                    </div>
                    <span className="text-xs font-semibold text-foreground-muted">
                        {transaction.items?.length || 0} line items
                    </span>
                </div>

                {transaction.items && transaction.items.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-foreground">
                            <thead className="border-b border-border text-xs uppercase font-bold text-foreground-muted bg-surface-secondary/20">
                                <tr>
                                    <th className="px-6 py-3.5">#</th>
                                    <th className="px-6 py-3.5">Item Name</th>
                                    <th className="px-6 py-3.5 text-center">Quantity</th>
                                    <th className="px-6 py-3.5 text-right">Unit Price</th>
                                    <th className="px-6 py-3.5 text-right">Total Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {transaction.items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-surface-secondary/30 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-foreground-muted">{idx + 1}</td>
                                        <td className="px-6 py-4 font-semibold text-foreground">{item.name}</td>
                                        <td className="px-6 py-4 text-center font-medium text-foreground-muted">{item.quantity}</td>
                                        <td className="px-6 py-4 text-right font-medium text-foreground-muted">${item.price.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-foreground">${item.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t-2 border-border bg-surface-secondary/40 font-bold">
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-right text-xs uppercase tracking-wider text-foreground-muted">
                                        Grand Total
                                    </td>
                                    <td className="px-6 py-4 text-right text-base text-primary">
                                        ${transaction.amount.toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center text-xs text-foreground-muted">
                        No itemized line details recorded for this transaction.
                    </div>
                )}
            </div>

            {/* Edit Modal Component */}
            <EditTransactionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                transaction={transaction}
                onTransactionUpdated={fetchDetails}
            />

            {/* Delete Confirmation Alert Dialog */}
            <DeleteTransactionDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                transaction={transaction}
                onTransactionDeleted={() => {
                    router.push("/transaction");
                }}
            />
        </div>
    );
}
