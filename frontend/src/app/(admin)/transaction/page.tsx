"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    transactionService,
    contactService,
    TransactionResponse,
    ContactResponse,
} from "@/services/transactionService";
import { walletService, Wallet } from "@/services/walletService";
import { CreateTransactionModal } from "@/components/transaction/CreateTransactionModal";
import { CreateContactModal } from "@/components/transaction/CreateContactModal";
import Pagination from "@/components/tables/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/context/WorkspaceContext";
import { toast } from "react-hot-toast";
import {
    Receipt,
    Plus,
    Search,
    Users,
    ArrowUpRight,
    ArrowDownLeft,
    ArrowRightLeft,
    ArrowUpDown,
    Tag,
    Calendar,
    Wallet as WalletIcon,
    ChevronDown,
    ChevronUp,
    Building2,
    Eye,
    Edit,
    Trash2,
} from "lucide-react";

export default function TransactionsPage() {
    const { activeWorkspace } = useWorkspace();

    // Data States
    const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
    const [contacts, setContacts] = useState<ContactResponse[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    
    // Separate loading states to avoid unmounting the whole page on parameter changes
    const [metaLoading, setMetaLoading] = useState(true);
    const [txLoading, setTxLoading] = useState(true);

    // Pagination & Sorting States
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [sortField, setSortField] = useState("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Active tab: 'transactions' | 'contacts'
    const [activeTab, setActiveTab] = useState<"transactions" | "contacts">("transactions");

    // Modal open states
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    // Expand state for itemized transaction details
    const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [walletFilter, setWalletFilter] = useState("all");

    // Fetch contacts & wallets metadata on workspace change
    const fetchMetadata = useCallback(async () => {
        if (!activeWorkspace) return;
        setMetaLoading(true);
        try {
            const [contactData, walletData] = await Promise.all([
                contactService.listContacts(),
                walletService.listWallets(),
            ]);
            setContacts(contactData || []);
            setWallets(walletData || []);
        } catch (err: unknown) {
            console.error("Failed to load metadata", err);
        } finally {
            setMetaLoading(false);
        }
    }, [activeWorkspace]);

    // Fetch transactions when pagination/search/sort parameters change
    const fetchTransactions = useCallback(async () => {
        if (!activeWorkspace) return;
        setTxLoading(true);
        try {
            const txRes = await transactionService.listTransactions({
                page,
                limit,
                search: searchQuery,
                sort: sortField,
                order: sortOrder,
            });
            setTransactions(txRes?.items || []);
            setTotalPages(txRes?.total_pages || 1);
            setTotalTransactions(txRes?.total || 0);
        } catch (err: unknown) {
            console.error("Failed to load transactions", err);
            toast.error("Failed to load transaction records.");
        } finally {
            setTxLoading(false);
        }
    }, [activeWorkspace, page, limit, searchQuery, sortField, sortOrder]);

    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleRefreshAll = () => {
        fetchMetadata();
        fetchTransactions();
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortOrder("desc");
        }
        setPage(1);
    };

    const handleNotImplemented = (feature: string) => {
        toast.error(`${feature} endpoint is not yet available in the backend API.`);
    };

    const getWalletName = (wId: string) => {
        const found = wallets.find((w) => w.id === wId);
        return found ? found.name : "Unknown Wallet";
    };

    const getContactName = (cId?: string) => {
        if (!cId) return null;
        const found = contacts.find((c) => c.id === cId);
        return found ? found.name : null;
    };

    const getTypeBadge = (type: string) => {
        switch (type.toLowerCase()) {
            case "income":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <ArrowDownLeft className="h-3.5 w-3.5" /> Income
                    </span>
                );
            case "expense":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                        <ArrowUpRight className="h-3.5 w-3.5" /> Expense
                    </span>
                );
            case "transfer-in":
            case "transfer-out":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <ArrowRightLeft className="h-3.5 w-3.5" /> Transfer
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/10 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize">
                        {type}
                    </span>
                );
        }
    };

    // Filtered lists
    const filteredTransactions = transactions.filter((tx) => {
        const matchesType = typeFilter === "all" || tx.type === typeFilter;
        const matchesWallet = walletFilter === "all" || tx.wallet_id === walletFilter;
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            !query ||
            (tx.description && tx.description.toLowerCase().includes(query)) ||
            tx.type.toLowerCase().includes(query) ||
            tx.amount.toString().includes(query) ||
            (tx.tags && tx.tags.some((t) => {
                const tagName = typeof t === "string" ? t : t.name;
                return tagName && tagName.toLowerCase().includes(query);
            }));
        return matchesType && matchesWallet && matchesSearch;
    });

    const filteredContacts = contacts.filter((c) => {
        const query = searchQuery.toLowerCase();
        return (
            !query ||
            c.name.toLowerCase().includes(query) ||
            c.type.toLowerCase().includes(query) ||
            (c.email && c.email.toLowerCase().includes(query))
        );
    });

    // Summary Statistics
    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                        <Receipt className="h-3.5 w-3.5" /> Ledger & Management
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Transactions & Contacts
                    </h1>
                    <p className="mt-1 text-sm text-foreground-muted max-w-md">
                        Track income, expenses, line items, and contacts across your workspace.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsContactModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-secondary transition-all"
                    >
                        <Users className="h-4 w-4 text-primary" /> Add Contact
                    </button>
                    <button
                        onClick={() => setIsTxModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-hover transition-all hover:scale-[1.02]"
                    >
                        <Plus className="h-4 w-4" /> New Transaction
                    </button>
                </div>
            </div>

            {/* Summary Statistics Strip */}
            {metaLoading && txLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="rounded-2xl border border-border bg-surface p-4 text-center">
                            <Skeleton className="h-3 w-20 mx-auto mb-2" />
                            <Skeleton className="h-7 w-24 mx-auto" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-xs">
                        <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Total Recorded</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{totalTransactions}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-xs">
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Total Income</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">${totalIncome.toFixed(2)}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-xs">
                        <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Total Expense</p>
                        <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">${totalExpense.toFixed(2)}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-xs">
                        <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Total Contacts</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{contacts.length}</p>
                    </div>
                </div>
            )}

            {/* Navigation Tabs & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex gap-2 bg-surface-secondary/60 p-1 rounded-xl border border-border w-fit">
                    <button
                        onClick={() => setActiveTab("transactions")}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                            activeTab === "transactions"
                                ? "bg-surface text-primary shadow-xs"
                                : "text-foreground-muted hover:text-foreground"
                        }`}
                    >
                        <Receipt className="h-4 w-4" /> Transactions ({totalTransactions})
                    </button>
                    <button
                        onClick={() => setActiveTab("contacts")}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                            activeTab === "contacts"
                                ? "bg-surface text-primary shadow-xs"
                                : "text-foreground-muted hover:text-foreground"
                        }`}
                    >
                        <Users className="h-4 w-4" /> Contacts Directory ({contacts.length})
                    </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                        <input
                            type="text"
                            placeholder={activeTab === "transactions" ? "Search transactions, tags..." : "Search contacts..."}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-xl border border-border bg-surface pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none"
                        />
                    </div>

                    {activeTab === "transactions" && (
                        <>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                            >
                                <option value="all">All Types</option>
                                <option value="expense">Expenses</option>
                                <option value="income">Income</option>
                                <option value="transfer-in">Transfers</option>
                                <option value="investment">Investments</option>
                            </select>

                            <select
                                value={walletFilter}
                                onChange={(e) => setWalletFilter(e.target.value)}
                                className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                            >
                                <option value="all">All Wallets</option>
                                {wallets.map((w) => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>

                            <select
                                value={sortField}
                                onChange={(e) => {
                                    setSortField(e.target.value);
                                    setPage(1);
                                }}
                                className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                            >
                                <option value="date">Sort by Date</option>
                                <option value="amount">Sort by Amount</option>
                                <option value="description">Sort by Description</option>
                            </select>

                            <button
                                onClick={() => {
                                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                                    setPage(1);
                                }}
                                title={`Sort Order: ${sortOrder.toUpperCase()}`}
                                className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-secondary transition-all"
                            >
                                <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                <span className="uppercase">{sortOrder}</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* TAB CONTENT */}
            {activeTab === "transactions" ? (
                /* TRANSACTIONS TAB */
                <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-foreground">
                            <thead className="border-b border-border bg-surface-secondary/60 text-xs uppercase font-bold text-foreground-muted">
                                <tr>
                                    <th
                                        onClick={() => handleSort("date")}
                                        className="px-6 py-4 cursor-pointer select-none hover:text-foreground transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            Date {sortField === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4">Type</th>
                                    <th
                                        onClick={() => handleSort("description")}
                                        className="px-6 py-4 cursor-pointer select-none hover:text-foreground transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            Description / Items {sortField === "description" && (sortOrder === "asc" ? "↑" : "↓")}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4">Tags</th>
                                    <th className="px-6 py-4">Wallet</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th
                                        onClick={() => handleSort("amount")}
                                        className="px-6 py-4 text-right cursor-pointer select-none hover:text-foreground transition-colors"
                                    >
                                        <div className="flex items-center justify-end gap-1">
                                            Amount {sortField === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {txLoading ? (
                                    /* Skeleton Rows during transaction load/change */
                                    Array.from({ length: limit }).map((_, idx) => (
                                        <tr key={idx} className="animate-pulse">
                                            <td className="px-6 py-4">
                                                <Skeleton className="h-4 w-24 rounded-md" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <Skeleton className="h-6 w-20 rounded-full" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <Skeleton className="h-4 w-40 rounded-md" />
                                                    <Skeleton className="h-3 w-24 rounded-md" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Skeleton className="h-5 w-16 rounded-md" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <Skeleton className="h-4 w-24 rounded-md" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <Skeleton className="h-4 w-20 rounded-md" />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Skeleton className="h-4 w-16 rounded-md ml-auto" />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Skeleton className="h-6 w-12 rounded-md mx-auto" />
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                                                    <Receipt className="h-7 w-7" />
                                                </div>
                                                <h3 className="text-base font-bold text-foreground">No transactions found</h3>
                                                <p className="mt-1 text-xs text-foreground-muted max-w-xs">
                                                    Start recording income, expenses, or line items for your workspace.
                                                </p>
                                                <button
                                                    onClick={() => setIsTxModalOpen(true)}
                                                    className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow hover:bg-primary-hover transition-all"
                                                >
                                                    <Plus className="h-3.5 w-3.5" /> Create First Transaction
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((tx) => {
                                        const isExpanded = expandedTxId === tx.id;
                                        const contactName = getContactName(tx.contact_id);

                                        return (
                                            <React.Fragment key={tx.id}>
                                                <tr className="hover:bg-surface-secondary/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-xs text-foreground-muted whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5 text-primary" />
                                                            {new Date(tx.date).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getTypeBadge(tx.type)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-semibold text-foreground">
                                                                {tx.description || "No description"}
                                                            </p>
                                                            {tx.items && tx.items.length > 0 && (
                                                                <button
                                                                    onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                                                                    className="mt-1 flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                                                                >
                                                                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                                    {tx.items.length} itemized {tx.items.length === 1 ? "line" : "lines"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {tx.tags && tx.tags.length > 0 ? (
                                                            <div className="flex flex-wrap items-center gap-1">
                                                                {tx.tags.slice(0, 2).map((t, idx) => {
                                                                    const tagName = typeof t === "string" ? t : t.name;
                                                                    const tagKey = typeof t === "string" ? t : t.id || idx;
                                                                    return (
                                                                        <span key={tagKey} className="inline-flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-semibold whitespace-nowrap">
                                                                            <Tag className="h-2.5 w-2.5" /> {tagName}
                                                                        </span>
                                                                    );
                                                                })}
                                                                {tx.tags.length > 2 && (
                                                                    <span
                                                                        title={tx.tags.map((t) => typeof t === "string" ? t : t.name).slice(2).join(", ")}
                                                                        className="inline-flex items-center text-[10px] bg-surface-secondary text-foreground-muted border border-border px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap"
                                                                    >
                                                                        +{tx.tags.length - 2} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-foreground-muted">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <WalletIcon className="h-3.5 w-3.5 text-foreground-muted" />
                                                            {getWalletName(tx.wallet_id)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-foreground-muted">
                                                        {contactName ? (
                                                            <span className="inline-flex items-center gap-1 text-foreground font-semibold">
                                                                <Building2 className="h-3.5 w-3.5 text-primary" /> {contactName}
                                                            </span>
                                                        ) : (
                                                            "—"
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        <span
                                                            className={`font-bold text-sm ${
                                                                tx.type === "income"
                                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                                    : tx.type === "expense"
                                                                    ? "text-rose-600 dark:text-rose-400"
                                                                    : "text-foreground"
                                                            }`}
                                                        >
                                                            {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                                                            ${tx.amount.toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => handleNotImplemented("View Transaction")}
                                                                title="View Details"
                                                                className="p-1.5 rounded-lg text-foreground-muted hover:bg-surface-secondary hover:text-foreground transition-all"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleNotImplemented("Edit Transaction")}
                                                                title="Edit (API Pending)"
                                                                className="p-1.5 rounded-lg text-foreground-muted hover:bg-surface-secondary hover:text-foreground transition-all"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleNotImplemented("Delete Transaction")}
                                                                title="Delete (API Pending)"
                                                                className="p-1.5 rounded-lg text-foreground-muted hover:bg-rose-500/10 hover:text-rose-600 transition-all"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Line Items Breakdown Expanded Row */}
                                                {isExpanded && tx.items && tx.items.length > 0 && (
                                                    <tr className="bg-surface-secondary/40 border-b border-border">
                                                        <td colSpan={8} className="px-8 py-3">
                                                            <div className="space-y-1.5">
                                                                <p className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                                                                    Line Items Breakdown
                                                                </p>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                    {tx.items.map((item, idx) => (
                                                                        <div key={idx} className="flex justify-between items-center bg-surface p-2.5 rounded-xl border border-border text-xs">
                                                                            <div>
                                                                                <span className="font-semibold text-foreground">{item.name}</span>
                                                                                <p className="text-[10px] text-foreground-muted">
                                                                                    {item.quantity} x ${item.price.toFixed(2)}
                                                                                </p>
                                                                            </div>
                                                                            <span className="font-bold text-foreground">${item.total.toFixed(2)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border px-6 py-4">
                        <div className="flex items-center gap-3">
                            <p className="text-xs text-foreground-muted">
                                Showing Page <span className="font-semibold text-foreground">{page}</span> of{" "}
                                <span className="font-semibold text-foreground">{totalPages}</span> ({totalTransactions} total transactions)
                            </p>
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                            >
                                <option value={10}>10 / page</option>
                                <option value={20}>20 / page</option>
                                <option value={50}>50 / page</option>
                                <option value={100}>100 / page</option>
                            </select>
                        </div>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={(newPage) => setPage(newPage)}
                        />
                    </div>
                </div>
            ) : (
                /* CONTACTS TAB */
                metaLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="rounded-2xl border border-border bg-surface p-5 space-y-3">
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-10 w-10 rounded-xl" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-5 w-36 rounded-md" />
                                <Skeleton className="h-4 w-48 rounded-md" />
                            </div>
                        ))}
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/70 bg-surface/50 py-20 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                            <Users className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No contacts found</h3>
                        <p className="mt-1 text-sm text-foreground-muted max-w-xs">
                            Add vendors, clients, or lenders to organize transactions.
                        </p>
                        <button
                            onClick={() => setIsContactModalOpen(true)}
                            className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary-hover transition-all"
                        >
                            <Plus className="h-4 w-4" /> Add First Contact
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredContacts.map((c) => (
                            <div key={c.id} className="rounded-2xl border border-border bg-surface p-5 shadow-xs hover:border-primary/30 transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                                        {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="inline-flex items-center rounded-full border border-border bg-surface-secondary px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                                        {c.type}
                                    </span>
                                </div>

                                <div className="mt-3">
                                    <h4 className="font-bold text-foreground text-base truncate">{c.name}</h4>
                                    {c.email && <p className="text-xs text-foreground-muted truncate mt-0.5">{c.email}</p>}
                                    {c.phone && <p className="text-xs text-foreground-muted truncate">{c.phone}</p>}
                                    {c.address && <p className="text-xs text-foreground-muted line-clamp-1 mt-1">{c.address}</p>}
                                </div>

                                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
                                    <button
                                        onClick={() => handleNotImplemented("Edit Contact")}
                                        className="text-xs font-semibold text-foreground-muted hover:text-foreground p-1"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleNotImplemented("Delete Contact")}
                                        className="text-xs font-semibold text-rose-600 hover:underline p-1"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Modals */}
            <CreateTransactionModal
                isOpen={isTxModalOpen}
                onClose={() => setIsTxModalOpen(false)}
                onTransactionCreated={handleRefreshAll}
            />

            <CreateContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                onContactCreated={handleRefreshAll}
            />
        </div>
    );
}
