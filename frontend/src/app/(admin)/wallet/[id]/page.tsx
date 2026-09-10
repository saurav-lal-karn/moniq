"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { walletService, WalletDetails, WalletType } from "@/services/walletService";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationModal } from "@/components/ui/modal/DeleteConfirmationModal";
import { EditWalletModal } from "../components/EditWalletModal";
import {
    Wallet as WalletIcon,
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    RefreshCw,
    Search,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Info,
    Coins,
    CreditCard,
    Landmark,
    Smartphone,
    Loader2,
    Copy,
    Check,
    ListFilter,
    ArrowUpDown,
} from "lucide-react";

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

const CURRENCIES: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    NPR: "₨",
    INR: "₹",
    CAD: "C$",
    AUD: "A$",
};

const TYPE_GRADIENTS: Record<string, [string, string]> = {
    cash: ["#10b981", "#059669"],
    coin: ["#f59e0b", "#d97706"],
    credit: ["#8b5cf6", "#7c3aed"],
    card: ["#8b5cf6", "#7c3aed"],
    bank: ["#3b82f6", "#2563eb"],
    saving: ["#3b82f6", "#2563eb"],
    checking: ["#3b82f6", "#2563eb"],
    mobile: ["#ec4899", "#db2777"],
    phone: ["#ec4899", "#db2777"],
    pay: ["#ec4899", "#db2777"],
};

function getGradient(typeName: string): [string, string] {
    const lower = typeName.toLowerCase();
    for (const [key, pair] of Object.entries(TYPE_GRADIENTS)) {
        if (lower.includes(key)) return pair;
    }
    return ["#0d9488", "#0f766e"];
}

export default function WalletDetailPage() {
    const params = useParams();
    const router = useRouter();
    const walletId = params?.id as string;

    const [wallet, setWallet] = useState<WalletDetails | null>(null);
    const [walletTypes, setWalletTypes] = useState<WalletType[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState("");
    const [directionFilter, setDirectionFilter] = useState<"all" | "credit" | "debit">("all");
    const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Edit & Delete modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadData = useCallback(async () => {
        if (!walletId) return;
        setLoading(true);
        try {
            const [walletData, typesData] = await Promise.all([
                walletService.getWallet(walletId),
                walletService.listWalletTypes(),
            ]);
            setWallet(walletData);
            setWalletTypes(typesData || []);
        } catch (err: unknown) {
            console.error("Failed to load wallet details", err);
            toast.error("Failed to load wallet details.");
        } finally {
            setLoading(false);
        }
    }, [walletId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const walletData = await walletService.getWallet(walletId);
            setWallet(walletData);
            toast.success("Wallet data refreshed");
        } catch {
            toast.error("Failed to refresh wallet details");
        } finally {
            setRefreshing(false);
        }
    };

    const handleDeleteWallet = async () => {
        if (!wallet) return;
        setIsDeleting(true);
        try {
            await walletService.deleteWallet(wallet.id);
            toast.success("Wallet deleted successfully!");
            router.push("/wallet");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to delete wallet.";
            toast.error(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        toast.success(`${label} copied to clipboard!`);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Calculate Summary Stats from Ledger Entries
    const ledgerEntries = useMemo(() => wallet?.ledger_entries || [], [wallet?.ledger_entries]);

    const stats = useMemo(() => {
        let totalCredits = 0;
        let totalDebits = 0;

        ledgerEntries.forEach((entry) => {
            if (entry.direction === "credit") {
                totalCredits += entry.amount;
            } else if (entry.direction === "debit") {
                totalDebits += entry.amount;
            }
        });

        const currentBalance = totalCredits - totalDebits;

        return {
            totalCredits,
            totalDebits,
            currentBalance,
            count: ledgerEntries.length,
        };
    }, [ledgerEntries]);

    // Resolved wallet type name
    const typeName = useMemo(() => {
        if (!wallet?.type_id) return "General";
        const found = walletTypes.find((t) => t.id === wallet.type_id);
        return found ? found.name : "Category";
    }, [wallet?.type_id, walletTypes]);

    const [gradFrom, gradTo] = getGradient(typeName);
    const currencySymbol = wallet?.currency ? CURRENCIES[wallet.currency] || wallet.currency : "$";

    const getWalletIcon = (typeNameStr: string) => {
        const lower = typeNameStr.toLowerCase();
        if (lower.includes("cash") || lower.includes("coin")) return <Coins className="h-6 w-6" />;
        if (lower.includes("credit") || lower.includes("card")) return <CreditCard className="h-6 w-6" />;
        if (lower.includes("bank") || lower.includes("saving") || lower.includes("checking")) return <Landmark className="h-6 w-6" />;
        if (lower.includes("mobile") || lower.includes("phone") || lower.includes("pay")) return <Smartphone className="h-6 w-6" />;
        return <WalletIcon className="h-6 w-6" />;
    };

    // Filter and Sort Ledger Entries
    const filteredEntries = useMemo(() => {
        return ledgerEntries
            .filter((entry) => {
                if (directionFilter !== "all" && entry.direction !== directionFilter) {
                    return false;
                }
                if (searchTerm.trim() !== "") {
                    const term = searchTerm.toLowerCase();
                    const matchDesc = entry.description?.toLowerCase().includes(term);
                    const matchTxId = entry.transaction_id.toLowerCase().includes(term);
                    const matchId = entry.id.toLowerCase().includes(term);
                    return matchDesc || matchTxId || matchId;
                }
                return true;
            })
            .sort((a, b) => {
                if (sortBy === "date-desc") {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                }
                if (sortBy === "date-asc") {
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                }
                if (sortBy === "amount-desc") {
                    return b.amount - a.amount;
                }
                if (sortBy === "amount-asc") {
                    return a.amount - b.amount;
                }
                return 0;
            });
    }, [ledgerEntries, directionFilter, searchTerm, sortBy]);

    const formatCurrency = (amount: number) => {
        return `${currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4 animate-fade-in">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-semibold text-foreground-muted">Loading wallet details...</p>
            </div>
        );
    }

    if (!wallet) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-900/20">
                    <AlertCircle className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Wallet Not Found</h2>
                <p className="text-sm text-foreground-muted max-w-sm">
                    The requested wallet could not be loaded or may have been deleted.
                </p>
                <Link href="/wallet">
                    <Button variant="secondary" className="rounded-xl flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Wallets
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* ─── Breadcrumb & Actions Bar ─── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
                <div className="flex items-center gap-3">
                    <Link
                        href="/wallet"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground-muted hover:bg-surface-secondary hover:text-foreground transition-colors"
                        title="Back to Wallets"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                            <span>Wallets</span>
                            <span>/</span>
                            <span className="text-foreground">{wallet.name}</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5 flex items-center gap-2">
                            {wallet.name}
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="rounded-xl border border-border bg-surface text-foreground-muted hover:bg-surface-secondary hover:text-foreground flex items-center gap-2"
                        title="Refresh data"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>

                    <Link href="/transaction">
                        <Button className="rounded-xl bg-primary text-white hover:bg-primary-hover flex items-center gap-2 shadow-sm">
                            <Plus className="h-4 w-4" />
                            <span>Add Transaction</span>
                        </Button>
                    </Link>

                    <Button
                        variant="secondary"
                        onClick={() => setIsEditModalOpen(true)}
                        className="rounded-xl border border-border bg-surface text-foreground hover:bg-surface-secondary flex items-center gap-2"
                    >
                        <Edit2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                    </Button>
                </div>
            </div>

            {/* ─── Hero Wallet Card ─── */}
            <div
                className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl"
                style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
            >
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner">
                                {getWalletIcon(typeName)}
                            </div>
                            <div>
                                <span className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
                                    {typeName}
                                </span>
                                <p className="text-xs text-white/80 mt-1">Currency: {wallet.currency}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-widest text-white/70 font-semibold">Current Calculated Balance</p>
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
                                {formatCurrency(stats.currentBalance)}
                            </h2>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/15 max-w-md w-full">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-1">Description</p>
                        <p className="text-sm text-white/95 leading-relaxed">
                            {wallet.description || "No description provided for this wallet."}
                        </p>
                    </div>
                </div>

                {/* Aesthetic Background Shapes */}
                <div className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-black/10 blur-xl" />
            </div>

            {/* ─── Metrics Grid ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Total Inflow (Credits)</p>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            +{formatCurrency(stats.totalCredits)}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                        <TrendingDown className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Total Outflow (Debits)</p>
                        <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                            -{formatCurrency(stats.totalDebits)}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <ArrowUpDown className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Total Transactions</p>
                        <p className="text-xl font-bold text-foreground mt-0.5">{stats.count}</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Account Status</p>
                        <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            Active
                        </span>
                    </div>
                </div>
            </div>

            {/* ─── Wallet Metadata Section ─── */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        <h3 className="text-base font-bold text-foreground">Wallet Details & Information</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="rounded-xl border border-border bg-surface-secondary/40 p-3.5 space-y-1">
                        <div className="text-foreground-muted font-semibold uppercase">Wallet Name</div>
                        <p className="font-semibold text-foreground">{wallet.name}</p>
                    </div>

                    <div className="rounded-xl border border-border bg-surface-secondary/40 p-3.5 space-y-1">
                        <div className="text-foreground-muted font-semibold uppercase">Wallet Type</div>
                        <p className="font-semibold text-foreground">{wallet.type?.name || typeName}</p>
                    </div>

                    <div className="rounded-xl border border-border bg-surface-secondary/40 p-3.5 space-y-1">
                        <div className="text-foreground-muted font-semibold uppercase">Currency</div>
                        <p className="font-semibold text-foreground">{wallet.currency}</p>
                    </div>

                    <div className="rounded-xl border border-border bg-surface-secondary/40 p-3.5 space-y-1">
                        <div className="text-foreground-muted font-semibold uppercase flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-foreground-muted" /> Created At
                        </div>
                        <p className="font-medium text-foreground">
                            {wallet.created_at ? formatDate(wallet.created_at) : "N/A"}
                        </p>
                    </div>

                    {wallet.user && (
                        <div className="rounded-xl border border-border bg-surface-secondary/40 p-3.5 space-y-1 sm:col-span-2">
                            <div className="text-foreground-muted font-semibold uppercase">Created By</div>
                            <div className="flex items-center gap-2.5 pt-0.5">
                                {wallet.user.profile_picture_url ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={wallet.user.profile_picture_url}
                                        alt={wallet.user.first_name}
                                        className="h-6 w-6 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                                        {wallet.user.first_name?.[0]}
                                    </div>
                                )}
                                <p className="font-medium text-foreground">
                                    {wallet.user.first_name} {wallet.user.last_name || ""}
                                    <span className="text-foreground-muted font-normal text-[11px] ml-1.5">
                                        ({wallet.user.email})
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Ledger Transactions List Section ─── */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
                    <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <ListFilter className="h-5 w-5 text-primary" />
                            Ledger Transactions List
                        </h3>
                        <p className="text-xs text-foreground-muted mt-0.5">
                            Showing {filteredEntries.length} of {ledgerEntries.length} entries for this wallet.
                        </p>
                    </div>

                    {/* Filter controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-surface-secondary text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20 w-48 sm:w-60"
                            />
                        </div>

                        {/* Direction filter */}
                        <div className="flex items-center rounded-xl border border-border bg-surface-secondary p-1">
                            <button
                                onClick={() => setDirectionFilter("all")}
                                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${directionFilter === "all"
                                        ? "bg-surface text-foreground shadow-xs"
                                        : "text-foreground-muted hover:text-foreground"
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setDirectionFilter("credit")}
                                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${directionFilter === "credit"
                                        ? "bg-emerald-500 text-white shadow-xs"
                                        : "text-foreground-muted hover:text-emerald-600"
                                    }`}
                            >
                                Credits (+ / In)
                            </button>
                            <button
                                onClick={() => setDirectionFilter("debit")}
                                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${directionFilter === "debit"
                                        ? "bg-rose-500 text-white shadow-xs"
                                        : "text-foreground-muted hover:text-rose-600"
                                    }`}
                            >
                                Debits (- / Out)
                            </button>
                        </div>

                        {/* Sort Selector */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="py-2 px-3 text-xs rounded-xl border border-border bg-surface-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="date-desc">Newest Date</option>
                            <option value="date-asc">Oldest Date</option>
                            <option value="amount-desc">Highest Amount</option>
                            <option value="amount-asc">Lowest Amount</option>
                        </select>
                    </div>
                </div>

                {/* Transactions Table */}
                {filteredEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-secondary text-foreground-muted">
                            <Search className="h-6 w-6" />
                        </div>
                        <p className="text-base font-bold text-foreground">No ledger transactions found</p>
                        <p className="text-xs text-foreground-muted max-w-xs">
                            {ledgerEntries.length === 0
                                ? "This wallet does not have any recorded transactions yet."
                                : "No entries match your search criteria or direction filter."}
                        </p>
                        {ledgerEntries.length > 0 && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setSearchTerm("");
                                    setDirectionFilter("all");
                                }}
                                className="rounded-xl mt-2"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-border">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-surface-secondary/80 text-foreground-muted uppercase tracking-wider font-semibold border-b border-border">
                                <tr>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Description</th>
                                    <th className="py-3 px-4">Direction</th>
                                    <th className="py-3 px-4 text-right">Amount</th>
                                    <th className="py-3 px-4">Transaction ID</th>
                                    <th className="py-3 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredEntries.map((entry) => {
                                    const isCredit = entry.direction === "credit";
                                    return (
                                        <tr key={entry.id} className="hover:bg-surface-secondary/40 transition-colors">
                                            <td className="py-3.5 px-4 font-medium text-foreground whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-foreground-muted" />
                                                    {formatDate(entry.date)}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-foreground max-w-xs truncate">
                                                {entry.description || <span className="text-foreground-muted italic">No description</span>}
                                            </td>

                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${isCredit
                                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                                        }`}
                                                >
                                                    {isCredit ? (
                                                        <>
                                                            <ArrowDownRight className="h-3 w-3" /> Credit
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ArrowUpRight className="h-3 w-3" /> Debit
                                                        </>
                                                    )}
                                                </span>
                                            </td>

                                            <td className={`py-3.5 px-4 font-bold text-right text-sm whitespace-nowrap ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                                }`}>
                                                {isCredit ? "+" : "-"}{formatCurrency(entry.amount)}
                                            </td>

                                            <td className="py-3.5 px-4 font-mono text-foreground-muted whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="truncate max-w-[100px]" title={entry.transaction_id}>
                                                        {entry.transaction_id}
                                                    </span>
                                                    <button
                                                        onClick={() => copyToClipboard(entry.transaction_id, "Transaction ID")}
                                                        className="hover:text-foreground transition-colors p-1"
                                                        title="Copy Transaction ID"
                                                    >
                                                        {copiedId === entry.transaction_id ? (
                                                            <Check className="h-3 w-3 text-emerald-500" />
                                                        ) : (
                                                            <Copy className="h-3 w-3" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                <Link
                                                    href={`/transaction`}
                                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                                                >
                                                    View Details <ArrowUpRight className="h-3 w-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ─── Edit Wallet Modal ─── */}
            <EditWalletModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                wallet={wallet}
                walletTypes={walletTypes}
                currencies={[
                    { code: "USD", symbol: "$", name: "US Dollar" },
                    { code: "EUR", symbol: "€", name: "Euro" },
                    { code: "GBP", symbol: "£", name: "British Pound" },
                    { code: "NPR", symbol: "₨", name: "Nepalese Rupee" },
                    { code: "INR", symbol: "₹", name: "Indian Rupee" },
                    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
                    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
                ]}
                onSuccess={() => loadData()}
            />

            {/* ─── Delete Wallet Modal ─── */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteWallet}
                title="Delete Wallet"
                description={`Are you sure you want to delete "${wallet.name}"? This action cannot be undone.`}
                isDeleting={isDeleting}
            />
        </div>
    );
}
