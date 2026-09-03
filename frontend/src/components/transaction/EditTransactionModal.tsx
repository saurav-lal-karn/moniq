"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
    transactionService,
    ContactResponse,
    TransactionItem,
    contactService,
    tagService,
    TransactionResponse,
    UpdateTransactionRequest,
} from "@/services/transactionService";
import { walletService, Wallet } from "@/services/walletService";
import { toast } from "react-hot-toast";
import {
    Plus,
    Trash2,
    Edit3,
    Loader2,
    DollarSign,
    Tag as TagIcon,
} from "lucide-react";

interface EditTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: TransactionResponse | null;
    onTransactionUpdated?: () => void;
}

const TRANSACTION_TYPES = [
    { label: "Expense", value: "expense", desc: "Outflow from wallet" },
    { label: "Income", value: "income", desc: "Inflow to wallet" },
    { label: "Transfer In", value: "transfer-in", desc: "Incoming transfer" },
    { label: "Transfer Out", value: "transfer-out", desc: "Outgoing transfer" },
    { label: "Investment", value: "investment", desc: "Capital investment" },
    { label: "Other", value: "other", desc: "Miscellaneous" },
];

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
    isOpen,
    onClose,
    transaction,
    onTransactionUpdated,
}) => {
    const [amount, setAmount] = useState<number | "">("");
    const [date, setDate] = useState<string>("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("expense");
    const [walletId, setWalletId] = useState("");
    const [destinationWalletId, setDestinationWalletId] = useState("");
    const [contactId, setContactId] = useState("");
    const [items, setItems] = useState<TransactionItem[]>([]);
    const [tagsInput, setTagsInput] = useState("");

    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [contacts, setContacts] = useState<ContactResponse[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen || !transaction) return;

        // Populate fields from selected transaction
        setAmount(transaction.amount || "");
        setDate(
            transaction.date
                ? new Date(transaction.date).toISOString().split("T")[0]
                : ""
        );
        setDescription(transaction.description || "");
        setType(transaction.type || "expense");
        setWalletId(transaction.wallet_id || "");
        setDestinationWalletId(transaction.destination_wallet_id || "");
        setContactId(transaction.contact_id || "");
        setItems(
            transaction.items && transaction.items.length > 0
                ? transaction.items
                : [{ name: "", quantity: 1, price: 0, total: 0 }]
        );

        if (transaction.tags && transaction.tags.length > 0) {
            const formattedTags = transaction.tags
                .map((t) => (typeof t === "string" ? t : t.name))
                .join(", ");
            setTagsInput(formattedTags);
        } else {
            setTagsInput("");
        }

        const loadOptions = async () => {
            setLoadingData(true);
            try {
                const [walletsData, contactsData] = await Promise.all([
                    walletService.listWallets(),
                    contactService.listContacts(),
                    tagService.listTags(),
                ]);
                setWallets(walletsData || []);
                setContacts(contactsData || []);
            } catch (err) {
                console.error("Error loading dropdown options:", err);
            } finally {
                setLoadingData(false);
            }
        };

        loadOptions();
    }, [isOpen, transaction]);

    const handleItemChange = (
        index: number,
        field: keyof TransactionItem,
        val: string | number
    ) => {
        const nextItems = [...items];
        const item = { ...nextItems[index] };

        if (field === "name") {
            item.name = val as string;
        } else if (field === "quantity") {
            const q = parseFloat(val as string) || 0;
            item.quantity = q;
            item.total = q * item.price;
        } else if (field === "price") {
            const p = parseFloat(val as string) || 0;
            item.price = p;
            item.total = item.quantity * p;
        }

        nextItems[index] = item;
        setItems(nextItems);

        const calculatedSum = nextItems.reduce((acc, curr) => acc + (curr.total || 0), 0);
        if (calculatedSum > 0) {
            setAmount(calculatedSum);
        }
    };

    const addItemRow = () => {
        setItems([...items, { name: "", quantity: 1, price: 0, total: 0 }]);
    };

    const removeItemRow = (index: number) => {
        if (items.length <= 1) return;
        const nextItems = items.filter((_, i) => i !== index);
        setItems(nextItems);

        const calculatedSum = nextItems.reduce((acc, curr) => acc + (curr.total || 0), 0);
        if (calculatedSum > 0) setAmount(calculatedSum);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!transaction) return;

        if (!walletId) {
            toast.error("Please select a wallet");
            return;
        }

        const numericAmount = typeof amount === "number" ? amount : parseFloat(amount);
        if (!numericAmount || numericAmount <= 0) {
            toast.error("Amount must be greater than zero");
            return;
        }

        const validItems = items.filter((it) => it.name.trim() !== "");
        if (validItems.length === 0) {
            toast.error("At least one line item with a name is required");
            return;
        }

        const parsedTags = tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

        setSubmitting(true);

        const payload: Partial<UpdateTransactionRequest> = {
            id: transaction.id,
            amount: numericAmount,
            date,
            description: description.trim() || undefined,
            type,
            wallet_id: walletId,
            destination_wallet_id: destinationWalletId || undefined,
            contact_id: contactId || undefined,
            items: validItems.map((it) => ({
                name: it.name.trim(),
                quantity: it.quantity,
                price: it.price,
                total: it.total,
            })),
            tags: parsedTags.length > 0 ? parsedTags : undefined,
        };

        try {
            await transactionService.updateTransaction(transaction.id, payload);
            toast.success("Transaction updated successfully!");
            if (onTransactionUpdated) onTransactionUpdated();
            onClose();
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to update transaction";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const fieldCls = "mt-1 block w-full rounded-xl border border-border bg-surface-secondary px-3.5 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-150";
    const labelCls = "block text-xs font-semibold uppercase tracking-wider text-foreground-muted";

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-md">
                        <Edit3 className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground">Edit Transaction</h3>
                        <p className="text-xs text-foreground-muted">Update details for transaction #{transaction?.id.slice(0, 8)}</p>
                    </div>
                </div>

                {loadingData ? (
                    <div className="flex py-12 justify-center items-center gap-2 text-sm text-foreground-muted">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading transaction form...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Type & Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Transaction Type *</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className={fieldCls}
                                >
                                    {TRANSACTION_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label} - {t.desc}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className={fieldCls}
                                />
                            </div>
                        </div>

                        {/* Wallet & Contact */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Wallet *</label>
                                <select
                                    value={walletId}
                                    onChange={(e) => setWalletId(e.target.value)}
                                    required
                                    className={fieldCls}
                                >
                                    <option value="" disabled>Select wallet</option>
                                    {wallets.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.name} ({w.currency})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelCls}>Contact / Vendor</label>
                                <select
                                    value={contactId}
                                    onChange={(e) => setContactId(e.target.value)}
                                    className={fieldCls}
                                >
                                    <option value="">None / Optional</option>
                                    {contacts.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Amount & Description */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Total Amount *</label>
                                <div className="relative mt-1">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-foreground-muted">
                                        <DollarSign className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                        placeholder="0.00"
                                        className={`${fieldCls} pl-9 font-semibold text-base`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Office supplies from Acme"
                                    className={fieldCls}
                                />
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                                    Itemized Breakdown
                                </span>
                                <button
                                    type="button"
                                    onClick={addItemRow}
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Add Row
                                </button>
                            </div>

                            <div className="space-y-2">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-surface-secondary/50 p-2.5 rounded-xl border border-border">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                required
                                                placeholder="Item name"
                                                value={item.name}
                                                onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                                                className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div className="w-16">
                                            <input
                                                type="number"
                                                min="0.01"
                                                step="any"
                                                placeholder="Qty"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                                                className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-center text-foreground focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div className="w-20">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Price"
                                                value={item.price}
                                                onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                                                className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-right text-foreground focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div className="w-20 text-right text-xs font-bold text-foreground">
                                            ${item.total.toFixed(2)}
                                        </div>
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItemRow(idx)}
                                                className="p-1 text-foreground-muted hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className={labelCls}>Tags (comma separated)</label>
                            <div className="relative mt-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-foreground-muted">
                                    <TagIcon className="h-3.5 w-3.5" />
                                </div>
                                <input
                                    type="text"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                    placeholder="office, supplies, recurring"
                                    className={`${fieldCls} pl-9`}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-3 border-t border-border">
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
                                disabled={submitting}
                                className="rounded-xl bg-primary px-6 text-white hover:bg-primary-hover flex items-center gap-2 shadow-md transition-all"
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
};
