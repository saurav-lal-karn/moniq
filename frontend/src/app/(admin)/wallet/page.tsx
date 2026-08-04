"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { walletService, Wallet, WalletType } from "@/services/walletService";
import { useWorkspace } from "@/context/WorkspaceContext";
import { toast } from "react-hot-toast";
import {
    Wallet as WalletIcon,
    Eye,
    Edit2,
    Plus,
    Landmark,
    CreditCard,
    Coins,
    Smartphone,
    Layers,
    Loader2,
    ArrowUpRight,
    ChevronRight,
} from "lucide-react";

// List of supported currencies
const CURRENCIES = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "NPR", symbol: "₨", name: "Nepalese Rupee" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

// Wallet type → gradient colour pair
const TYPE_GRADIENTS: Record<string, [string, string]> = {
    cash:    ["#10b981", "#059669"],
    coin:    ["#f59e0b", "#d97706"],
    credit:  ["#8b5cf6", "#7c3aed"],
    card:    ["#8b5cf6", "#7c3aed"],
    bank:    ["#3b82f6", "#2563eb"],
    saving:  ["#3b82f6", "#2563eb"],
    checking:["#3b82f6", "#2563eb"],
    mobile:  ["#ec4899", "#db2777"],
    phone:   ["#ec4899", "#db2777"],
    pay:     ["#ec4899", "#db2777"],
};

function getGradient(typeName: string): [string, string] {
    const lower = typeName.toLowerCase();
    for (const [key, pair] of Object.entries(TYPE_GRADIENTS)) {
        if (lower.includes(key)) return pair;
    }
    return ["#0d9488", "#0f766e"]; // default teal
}

export default function WalletsPage() {
    const { activeWorkspace } = useWorkspace();

    // Data states
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [walletTypes, setWalletTypes] = useState<WalletType[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal open states
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

    // Form states - Wallet
    const [walletName, setWalletName] = useState("");
    const [walletDescription, setWalletDescription] = useState("");
    const [walletCurrency, setWalletCurrency] = useState("USD");
    const [selectedTypeId, setSelectedTypeId] = useState("");
    const [creatingWallet, setCreatingWallet] = useState(false);

    // Form states - Wallet Type
    const [typeName, setTypeName] = useState("");
    const [typeDescription, setTypeDescription] = useState("");
    const [creatingType, setCreatingType] = useState(false);

    const fetchData = useCallback(async () => {
        if (!activeWorkspace) return;
        setLoading(true);
        try {
            const [walletsData, typesData] = await Promise.all([
                walletService.listWallets(),
                walletService.listWalletTypes(),
            ]);
            setWallets(walletsData || []);
            setWalletTypes(typesData || []);
            if (typesData && typesData.length > 0) {
                setSelectedTypeId(typesData[0].id);
            }
        } catch (error: unknown) {
            console.error("Failed to load wallets data", error);
            toast.error("Failed to load wallets or wallet types.");
        } finally {
            setLoading(false);
        }
    }, [activeWorkspace]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCreateType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!typeName.trim()) { toast.error("Wallet type name is required."); return; }
        setCreatingType(true);
        try {
            await walletService.createWalletType({ name: typeName.trim(), description: typeDescription.trim() });
            toast.success("Wallet type created!");
            setTypeName(""); setTypeDescription(""); setIsTypeModalOpen(false);
            const updatedTypes = await walletService.listWalletTypes();
            setWalletTypes(updatedTypes || []);
            const newType = updatedTypes.find((t) => t.name.toLowerCase() === typeName.trim().toLowerCase());
            if (newType) setSelectedTypeId(newType.id);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to create wallet type.";
            toast.error(msg);
        } finally { setCreatingType(false); }
    };

    const handleCreateWallet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletName.trim()) { toast.error("Wallet name is required."); return; }
        if (!selectedTypeId) { toast.error("Please select a wallet type."); return; }
        setCreatingWallet(true);
        try {
            await walletService.createWallet({ name: walletName.trim(), currency: walletCurrency, type_id: selectedTypeId, description: walletDescription.trim() });
            toast.success("Wallet created!");
            setWalletName(""); setWalletDescription(""); setWalletCurrency("USD"); setIsWalletModalOpen(false);
            const updatedWallets = await walletService.listWallets();
            setWallets(updatedWallets || []);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to create wallet.";
            toast.error(msg);
        } finally { setCreatingWallet(false); }
    };

    const handleNotIntegrated = (actionName: string) => {
        toast.error(`${actionName} feature has not been integrated yet.`);
    };

    const getWalletIcon = (typeNameStr: string) => {
        const lower = typeNameStr.toLowerCase();
        if (lower.includes("cash") || lower.includes("coin")) return <Coins className="h-5 w-5" />;
        if (lower.includes("credit") || lower.includes("card")) return <CreditCard className="h-5 w-5" />;
        if (lower.includes("bank") || lower.includes("saving") || lower.includes("checking")) return <Landmark className="h-5 w-5" />;
        if (lower.includes("mobile") || lower.includes("phone") || lower.includes("pay")) return <Smartphone className="h-5 w-5" />;
        return <WalletIcon className="h-5 w-5" />;
    };

    const getTypeName = (typeId: string) => {
        const found = walletTypes.find((t) => t.id === typeId);
        return found ? found.name : "Unknown";
    };

    // Field class for consistent input styling in modals
    const fieldCls = "mt-1 block w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-150";
    const labelCls = "block text-xs font-semibold uppercase tracking-wider text-foreground-muted";

    return (
        <div className="space-y-8 animate-fade-in">
            {/* ─── Page Header ─── */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="animate-fade-in-down">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                        <WalletIcon className="h-3.5 w-3.5" />
                        Financial Accounts
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        My Wallets
                    </h1>
                    <p className="mt-1 text-sm text-foreground-muted max-w-md">
                        Manage your bank accounts, credit cards, and digital wallets across all your workspaces.
                    </p>
                </div>
                <Button
                    onClick={() => setIsWalletModalOpen(true)}
                    className="group flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-hover transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] animate-fade-in-down delay-100"
                >
                    <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                    Add Wallet
                </Button>
            </div>

            {/* ─── Summary Strip ─── */}
            {!loading && wallets.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up delay-75">
                    {[
                        { label: "Total Wallets", value: wallets.length },
                        { label: "Wallet Types", value: walletTypes.length },
                        { label: "Currencies", value: [...new Set(wallets.map(w => w.currency))].length },
                        { label: "Active", value: wallets.length },
                    ].map((stat, i) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-border bg-surface p-4 text-center shadow-xs animate-scale-in"
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-xs text-foreground-muted mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Content ─── */}
            {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-52 rounded-2xl border border-border bg-surface animate-pulse"
                            style={{ animationDelay: `${i * 100}ms` }}
                        />
                    ))}
                </div>
            ) : wallets.length === 0 ? (
                /* ─── Empty state ─── */
                <div className="animate-scale-in flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/70 bg-surface/50 py-20 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
                        <WalletIcon className="h-9 w-9" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">No wallets yet</h3>
                    <p className="mt-2 max-w-xs text-sm text-foreground-muted">
                        Add your first wallet to start tracking income, expenses, and balances.
                    </p>
                    <Button
                        onClick={() => setIsWalletModalOpen(true)}
                        className="mt-7 flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary-hover transition-all hover:shadow-md"
                    >
                        <Plus className="h-4 w-4" /> Create First Wallet
                    </Button>
                </div>
            ) : (
                /* ─── Wallet Cards Grid ─── */
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {wallets.map((wallet, idx) => {
                        const typeName = getTypeName(wallet.type_id);
                        const [gradFrom, gradTo] = getGradient(typeName);
                        return (
                            <div
                                key={wallet.id}
                                className="group relative overflow-hidden rounded-2xl border border-border bg-surface shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20 animate-fade-in-up"
                                style={{ animationDelay: `${idx * 60}ms` }}
                            >
                                {/* Gradient top bar */}
                                <div
                                    className="h-1.5 w-full transition-all duration-300 group-hover:h-2"
                                    style={{ background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})` }}
                                />

                                {/* Card body */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div
                                            className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm"
                                            style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
                                        >
                                            {getWalletIcon(typeName)}
                                        </div>
                                        <span className="inline-flex items-center rounded-full border border-border bg-surface-secondary px-2.5 py-0.5 text-[11px] font-bold tracking-widest text-foreground-muted uppercase">
                                            {wallet.currency}
                                        </span>
                                    </div>

                                    <div className="mt-5">
                                        <h4 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                                            {wallet.name}
                                        </h4>
                                        <p
                                            className="mt-0.5 text-xs font-semibold uppercase tracking-wider"
                                            style={{ color: gradFrom }}
                                        >
                                            {typeName}
                                        </p>
                                        <p className="mt-3 text-sm text-foreground-muted line-clamp-2 min-h-[2.5rem]">
                                            {wallet.description || "No description provided."}
                                        </p>
                                    </div>
                                </div>

                                {/* Card footer */}
                                <div className="flex items-center justify-between border-t border-border px-6 py-3 bg-surface-secondary/40">
                                    <button
                                        onClick={() => handleNotIntegrated("View Wallet")}
                                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground-muted hover:bg-surface-secondary hover:text-foreground transition-all duration-150"
                                    >
                                        <Eye className="h-3.5 w-3.5" /> View
                                    </button>
                                    <button
                                        onClick={() => handleNotIntegrated("Edit Wallet")}
                                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground-muted hover:bg-surface-secondary hover:text-foreground transition-all duration-150"
                                    >
                                        <Edit2 className="h-3.5 w-3.5" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleNotIntegrated("Wallet Transactions")}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline transition-colors"
                                    >
                                        Transactions <ArrowUpRight className="h-3 w-3" />
                                    </button>
                                </div>

                                {/* Subtle glow on hover */}
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                                    style={{ background: `radial-gradient(ellipse at top right, ${gradFrom}08, transparent 70%)` }}
                                />
                            </div>
                        );
                    })}

                    {/* Add wallet tile */}
                    <button
                        onClick={() => setIsWalletModalOpen(true)}
                        className="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/60 bg-transparent p-6 text-center transition-all duration-200 hover:border-primary/40 hover:bg-primary/4 animate-fade-in-up"
                        style={{ animationDelay: `${wallets.length * 60}ms` }}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-primary/30 text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:scale-110">
                            <Plus className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground-muted group-hover:text-primary transition-colors">Add Wallet</p>
                            <p className="text-xs text-foreground-muted/60 mt-0.5">Connect a new account</p>
                        </div>
                    </button>
                </div>
            )}

            {/* ─── Wallet Types Section ─── */}
            {!loading && walletTypes.length > 0 && (
                <div className="animate-fade-in-up delay-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                <Layers className="h-4 w-4 text-primary" /> Wallet Categories
                            </h2>
                            <p className="text-xs text-foreground-muted mt-0.5">Custom account types in your workspace</p>
                        </div>
                        <button
                            onClick={() => setIsTypeModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground-muted hover:text-primary hover:border-primary/30 transition-all duration-150"
                        >
                            <Plus className="h-3.5 w-3.5" /> New Category
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {walletTypes.map((type, idx) => {
                            const [gradFrom] = getGradient(type.name);
                            return (
                                <div
                                    key={type.id}
                                    className="group flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-xs hover:border-primary/30 hover:shadow transition-all duration-150 animate-scale-in"
                                    style={{ animationDelay: `${idx * 40}ms` }}
                                >
                                    <span className="h-2 w-2 rounded-full" style={{ background: gradFrom }} />
                                    {type.name}
                                    <ChevronRight className="h-3.5 w-3.5 text-foreground-muted opacity-0 group-hover:opacity-100 -mr-1 transition-all" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ─── Add Wallet Modal ─── */}
            <Modal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} className="max-w-md">
                <div className="p-6">
                    {/* Modal header with gradient */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow">
                            <WalletIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Create New Wallet</h3>
                            <p className="text-xs text-foreground-muted">Add a financial account to your workspace.</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateWallet} className="space-y-5">
                        <div>
                            <label className={labelCls}>Wallet Name *</label>
                            <input
                                type="text" required value={walletName}
                                onChange={(e) => setWalletName(e.target.value)}
                                placeholder="e.g. Chase Checking, Emergency Fund"
                                className={fieldCls}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Currency *</label>
                                <select value={walletCurrency} onChange={(e) => setWalletCurrency(e.target.value)} className={fieldCls}>
                                    {CURRENCIES.map((c) => (
                                        <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <label className={labelCls}>Type *</label>
                                    <button
                                        type="button" onClick={() => setIsTypeModalOpen(true)}
                                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                    >
                                        <Plus className="h-3 w-3" /> Custom
                                    </button>
                                </div>
                                <select value={selectedTypeId} onChange={(e) => setSelectedTypeId(e.target.value)} className={fieldCls}>
                                    {walletTypes.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Description</label>
                            <textarea
                                value={walletDescription}
                                onChange={(e) => setWalletDescription(e.target.value)}
                                placeholder="Optional notes about this wallet..."
                                rows={3}
                                className={`${fieldCls} resize-none`}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-1">
                            <Button type="button" variant="secondary" onClick={() => setIsWalletModalOpen(false)}
                                className="rounded-xl border border-border bg-surface px-4 text-foreground hover:bg-surface-secondary">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={creatingWallet}
                                className="rounded-xl bg-primary px-5 text-white hover:bg-primary-hover flex items-center gap-2 shadow hover:shadow-md transition-all">
                                {creatingWallet && <Loader2 className="h-4 w-4 animate-spin" />}
                                Create Wallet
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ─── Add Wallet Type Modal ─── */}
            <Modal isOpen={isTypeModalOpen} onClose={() => setIsTypeModalOpen(false)} className="max-w-md z-[100000]">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Layers className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">New Wallet Category</h3>
                            <p className="text-xs text-foreground-muted">Define a custom account type for your workspace.</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateType} className="space-y-5">
                        <div>
                            <label className={labelCls}>Category Name *</label>
                            <input
                                type="text" required value={typeName}
                                onChange={(e) => setTypeName(e.target.value)}
                                placeholder="e.g. Crypto Hardware Wallet, Line of Credit"
                                className={fieldCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Description</label>
                            <textarea
                                value={typeDescription}
                                onChange={(e) => setTypeDescription(e.target.value)}
                                placeholder="Guidelines for using this category..."
                                rows={3}
                                className={`${fieldCls} resize-none`}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-1">
                            <Button type="button" variant="secondary" onClick={() => setIsTypeModalOpen(false)}
                                className="rounded-xl border border-border bg-surface px-4 text-foreground hover:bg-surface-secondary">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={creatingType}
                                className="rounded-xl bg-primary px-5 text-white hover:bg-primary-hover flex items-center gap-2">
                                {creatingType && <Loader2 className="h-4 w-4 animate-spin" />}
                                Create Category
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
