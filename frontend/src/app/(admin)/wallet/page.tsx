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
    Info,
    Landmark,
    CreditCard,
    Coins,
    Smartphone,
    Layers,
    Loader2,
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

    // Fetch wallets and wallet types
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

            // Set default wallet type if available
            if (typesData && typesData.length > 0) {
                setSelectedTypeId(typesData[0].id);
            }
        } catch (error: any) {
            console.error("Failed to load wallets data", error);
            toast.error("Failed to load wallets or wallet types.");
        } finally {
            setLoading(false);
        }
    }, [activeWorkspace]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle Create Wallet Type
    const handleCreateType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!typeName.trim()) {
            toast.error("Wallet type name is required.");
            return;
        }

        setCreatingType(true);
        try {
            await walletService.createWalletType({
                name: typeName.trim(),
                description: typeDescription.trim(),
            });
            toast.success("Wallet type created successfully!");

            // Clear form and close modal
            setTypeName("");
            setTypeDescription("");
            setIsTypeModalOpen(false);

            // Refetch types
            const updatedTypes = await walletService.listWalletTypes();
            setWalletTypes(updatedTypes || []);

            // Find and select the newly created type
            const newType = updatedTypes.find(
                (t) => t.name.toLowerCase() === typeName.trim().toLowerCase()
            );
            if (newType) {
                setSelectedTypeId(newType.id);
            }
        } catch (error: any) {
            console.error("Failed to create wallet type", error);
            toast.error(error.message || "Failed to create wallet type.");
        } finally {
            setCreatingType(false);
        }
    };

    // Handle Create Wallet
    const handleCreateWallet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletName.trim()) {
            toast.error("Wallet name is required.");
            return;
        }
        if (!selectedTypeId) {
            toast.error("Please select a wallet type.");
            return;
        }

        setCreatingWallet(true);
        try {
            await walletService.createWallet({
                name: walletName.trim(),
                currency: walletCurrency,
                type_id: selectedTypeId,
                description: walletDescription.trim(),
            });
            toast.success("Wallet created successfully!");

            // Clear form and close modal
            setWalletName("");
            setWalletDescription("");
            setWalletCurrency("USD");
            setIsWalletModalOpen(false);

            // Refresh wallets list
            const updatedWallets = await walletService.listWallets();
            setWallets(updatedWallets || []);
        } catch (error: any) {
            console.error("Failed to create wallet", error);
            toast.error(error.message || "Failed to create wallet.");
        } finally {
            setCreatingWallet(false);
        }
    };

    // Placeholder actions
    const handleNotIntegrated = (actionName: string) => {
        toast.error(`${actionName} feature has not been integrated yet.`);
    };

    // Utility to get wallet type icon
    const getWalletIcon = (typeNameStr: string) => {
        const lower = typeNameStr.toLowerCase();
        if (lower.includes("cash") || lower.includes("coin")) return <Coins className="h-6 w-6" />;
        if (lower.includes("credit") || lower.includes("card")) return <CreditCard className="h-6 w-6" />;
        if (lower.includes("bank") || lower.includes("saving") || lower.includes("checking")) {
            return <Landmark className="h-6 w-6" />;
        }
        if (lower.includes("mobile") || lower.includes("phone") || lower.includes("pay")) {
            return <Smartphone className="h-6 w-6" />;
        }
        return <WalletIcon className="h-6 w-6" />;
    };

    // Map type ID to Name
    const getTypeName = (typeId: string) => {
        const found = walletTypes.find((t) => t.id === typeId);
        return found ? found.name : "Unknown Type";
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Wallets
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm text-gray-500">
                        Manage your financial accounts, bank accounts, and digital wallets.
                    </p>
                </div>
                <div>
                    <Button
                        onClick={() => setIsWalletModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-white hover:bg-primary-hover shadow-lg transition-transform active:scale-[0.98]"
                    >
                        <Plus className="h-5 w-5" />
                        Add Wallet
                    </Button>
                </div>
            </div>

            {/* Wallets Content */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : wallets.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-surface p-12 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                        <WalletIcon className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                        No wallets added yet
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        Create a wallet to start tracking your income, expenses, and transaction logs.
                    </p>
                    <div className="mt-6">
                        <Button
                            onClick={() => setIsWalletModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-primary text-white"
                        >
                            <Plus className="h-4 w-4" />
                            Create First Wallet
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {wallets.map((wallet) => {
                        const typeName = getTypeName(wallet.type_id);
                        return (
                            <div
                                key={wallet.id}
                                className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:border-primary/30"
                            >
                                {/* Background gradient accent */}
                                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                                        {getWalletIcon(typeName)}
                                    </div>
                                    <span className="inline-flex items-center rounded-full bg-surface-secondary border border-border px-2.5 py-0.5 text-xs font-semibold text-foreground uppercase">
                                        {wallet.currency}
                                    </span>
                                </div>

                                <div className="mt-4">
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                        {wallet.name}
                                    </h4>
                                    <p className="text-xs font-semibold text-primary uppercase mt-0.5 tracking-wider">
                                        {typeName}
                                    </p>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
                                        {wallet.description || "No description provided."}
                                    </p>
                                </div>

                                <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
                                    <button
                                        onClick={() => handleNotIntegrated("View Wallet")}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View
                                    </button>
                                    <span className="text-gray-300 dark:text-gray-700">|</span>
                                    <button
                                        onClick={() => handleNotIntegrated("Edit Wallet")}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        Edit
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Wallet Modal */}
            <Modal
                isOpen={isWalletModalOpen}
                onClose={() => setIsWalletModalOpen(false)}
                className="max-w-md p-6"
            >
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Create New Wallet
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Add a new financial wallet to your active workspace ledger.
                    </p>
                </div>

                <form onSubmit={handleCreateWallet} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Wallet Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={walletName}
                            onChange={(e) => setWalletName(e.target.value)}
                            placeholder="e.g. Chase Checkings, Cash Wallet"
                            className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Currency *
                        </label>
                        <select
                            value={walletCurrency}
                            onChange={(e) => setWalletCurrency(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
                        >
                            {CURRENCIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.code} ({c.symbol}) - {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Wallet Type *
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsTypeModalOpen(true)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                                <Plus className="h-3 w-3" />
                                Add Custom Type
                            </button>
                        </div>
                        <select
                            value={selectedTypeId}
                            onChange={(e) => setSelectedTypeId(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
                        >
                            {walletTypes.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <textarea
                            value={walletDescription}
                            onChange={(e) => setWalletDescription(e.target.value)}
                            placeholder="Optional notes or details about this wallet..."
                            rows={3}
                            className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsWalletModalOpen(false)}
                            className="rounded-lg border border-border bg-surface text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={creatingWallet}
                            className="rounded-lg bg-primary text-white hover:bg-primary-hover flex items-center gap-1"
                        >
                            {creatingWallet && <Loader2 className="h-4 w-4 animate-spin" />}
                            Create Wallet
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Add Wallet Type Modal */}
            <Modal
                isOpen={isTypeModalOpen}
                onClose={() => setIsTypeModalOpen(false)}
                className="max-w-md p-6 z-[100000]" // ensure it overlays on top of the wallet modal
            >
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        Create Custom Wallet Type
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Define a custom account category for your workspace.
                    </p>
                </div>

                <form onSubmit={handleCreateType} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Type Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={typeName}
                            onChange={(e) => setTypeName(e.target.value)}
                            placeholder="e.g. Crypto Hardware Wallet, Line of Credit"
                            className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <textarea
                            value={typeDescription}
                            onChange={(e) => setTypeDescription(e.target.value)}
                            placeholder="Optional notes or guidelines for using this wallet category..."
                            rows={3}
                            className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsTypeModalOpen(false)}
                            className="rounded-lg border border-border bg-surface text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={creatingType}
                            className="rounded-lg bg-primary text-white hover:bg-primary-hover flex items-center gap-1"
                        >
                            {creatingType && <Loader2 className="h-4 w-4 animate-spin" />}
                            Create Type
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
