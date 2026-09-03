"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { walletService, Wallet, WalletType } from "@/services/walletService";
import { toast } from "react-hot-toast";
import { Edit2, Loader2 } from "lucide-react";

interface EditWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    wallet: Wallet | null;
    walletTypes: WalletType[];
    currencies: { code: string; symbol: string; name: string }[];
    onSuccess: () => void;
}

export const EditWalletModal: React.FC<EditWalletModalProps> = ({
    isOpen,
    onClose,
    wallet,
    walletTypes,
    currencies,
    onSuccess,
}) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [typeId, setTypeId] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (wallet) {
            setName(wallet.name || "");
            setDescription(wallet.description || "");
            setCurrency(wallet.currency || "USD");
            setTypeId(wallet.type_id || "");
        }
    }, [wallet]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!wallet) return;
        if (!name.trim()) {
            toast.error("Wallet name is required.");
            return;
        }
        if (!typeId) {
            toast.error("Please select a wallet type.");
            return;
        }

        setUpdating(true);
        try {
            await walletService.updateWallet(wallet.id, {
                id: wallet.id,
                name: name.trim(),
                currency,
                type_id: typeId,
                description: description.trim(),
            });
            toast.success("Wallet updated successfully!");
            onSuccess();
            onClose();
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to update wallet.";
            toast.error(msg);
        } finally {
            setUpdating(false);
        }
    };

    const fieldCls = "mt-1 block w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-150";
    const labelCls = "block text-xs font-semibold uppercase tracking-wider text-foreground-muted";

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow">
                        <Edit2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Edit Wallet</h3>
                        <p className="text-xs text-foreground-muted">Update your financial account details.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className={labelCls}>Wallet Name *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Primary Checking"
                            className={fieldCls}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Currency *</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className={fieldCls}
                            >
                                {currencies.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.code} ({c.symbol})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Type *</label>
                            <select
                                value={typeId}
                                onChange={(e) => setTypeId(e.target.value)}
                                className={fieldCls}
                            >
                                {walletTypes.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional notes about this wallet..."
                            rows={3}
                            className={`${fieldCls} resize-none`}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="rounded-xl border border-border bg-surface px-4 text-foreground hover:bg-surface-secondary"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updating}
                            className="rounded-xl bg-primary px-5 text-white hover:bg-primary-hover flex items-center gap-2 shadow hover:shadow-md transition-all"
                        >
                            {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
