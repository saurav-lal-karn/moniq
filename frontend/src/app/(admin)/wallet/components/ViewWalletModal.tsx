"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { walletService, Wallet, WalletType } from "@/services/walletService";
import { toast } from "react-hot-toast";
import {
    Wallet as WalletIcon,
    Loader2,
    Edit2,
    Trash2,
    Coins,
    CreditCard,
    Landmark,
    Smartphone,
    Layers,
    Globe,
    Calendar,
    KeyRound,
} from "lucide-react";

interface ViewWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    walletId: string | null;
    walletTypes: WalletType[];
    onEdit: (wallet: Wallet) => void;
    onDelete: (wallet: Wallet) => void;
}

export const ViewWalletModal: React.FC<ViewWalletModalProps> = ({
    isOpen,
    onClose,
    walletId,
    walletTypes,
    onEdit,
    onDelete,
}) => {
    const [walletDetails, setWalletDetails] = useState<Wallet | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchDetails = useCallback(async () => {
        if (!walletId) return;
        setLoading(true);
        try {
            const data = await walletService.getWallet(walletId);
            setWalletDetails(data);
        } catch (error: unknown) {
            console.error("Failed to fetch wallet details", error);
            toast.error("Failed to load wallet details.");
        } finally {
            setLoading(false);
        }
    }, [walletId]);

    useEffect(() => {
        if (isOpen && walletId) {
            fetchDetails();
        } else {
            setWalletDetails(null);
        }
    }, [isOpen, walletId, fetchDetails]);

    const getTypeName = (typeId?: string) => {
        if (!typeId) return "Unknown";
        const found = walletTypes.find((t) => t.id === typeId);
        return found ? found.name : "Unknown";
    };

    const getWalletIcon = (typeNameStr: string) => {
        const lower = typeNameStr.toLowerCase();
        if (lower.includes("cash") || lower.includes("coin")) return <Coins className="h-6 w-6" />;
        if (lower.includes("credit") || lower.includes("card")) return <CreditCard className="h-6 w-6" />;
        if (lower.includes("bank") || lower.includes("saving") || lower.includes("checking")) return <Landmark className="h-6 w-6" />;
        if (lower.includes("mobile") || lower.includes("phone") || lower.includes("pay")) return <Smartphone className="h-6 w-6" />;
        return <WalletIcon className="h-6 w-6" />;
    };

    const typeName = walletDetails ? getTypeName(walletDetails.type_id) : "";

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <div className="p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium text-foreground-muted">Loading wallet details...</p>
                    </div>
                ) : walletDetails ? (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    {getWalletIcon(typeName)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">{walletDetails.name}</h3>
                                    <span className="inline-flex items-center rounded-full border border-border bg-surface-secondary px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary mt-1">
                                        {typeName}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="rounded-xl border border-border bg-surface-secondary/40 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1">
                                Description
                            </p>
                            <p className="text-sm text-foreground">
                                {walletDetails.description || "No description provided."}
                            </p>
                        </div>

                        {/* Detail Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-secondary text-foreground-muted">
                                    <Globe className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Currency</p>
                                    <p className="text-sm font-bold text-foreground">{walletDetails.currency}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-secondary text-foreground-muted">
                                    <Layers className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Category ID</p>
                                    <p className="text-xs font-mono text-foreground truncate max-w-[120px]" title={walletDetails.type_id}>
                                        {walletDetails.type_id}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-secondary text-foreground-muted">
                                    <KeyRound className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Wallet ID</p>
                                    <p className="text-xs font-mono text-foreground truncate max-w-[120px]" title={walletDetails.id}>
                                        {walletDetails.id}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-secondary text-foreground-muted">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Workspace ID</p>
                                    <p className="text-xs font-mono text-foreground truncate max-w-[120px]" title={walletDetails.workspace_id}>
                                        {walletDetails.workspace_id}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    onClose();
                                    onDelete(walletDetails);
                                }}
                                className="rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Wallet
                            </Button>

                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={onClose}
                                    className="rounded-xl border border-border bg-surface text-foreground hover:bg-surface-secondary"
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        onClose();
                                        onEdit(walletDetails);
                                    }}
                                    className="rounded-xl bg-primary text-white hover:bg-primary-hover flex items-center gap-2"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Edit Wallet
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-foreground-muted">
                        Wallet details unavailable.
                    </div>
                )}
            </div>
        </Modal>
    );
};
