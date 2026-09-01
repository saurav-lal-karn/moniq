"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
    transactionService,
    ContactResponse,
    TransactionItem,
    CreateTransactionRequest,
    contactService,
    tagService,
    TagResponse,
} from "@/services/transactionService";
import { walletService, Wallet } from "@/services/walletService";
import { CreateContactModal } from "./CreateContactModal";
import { CreateTagModal } from "./CreateTagModal";
import { toast } from "react-hot-toast";
import {
    Plus,
    Trash2,
    Receipt,
    UserPlus,
    Tag as TagIcon,
    Loader2,
    DollarSign,
    Tag,
} from "lucide-react";

interface CreateTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTransactionCreated: () => void;
}

const TRANSACTION_TYPES = [
    { label: "Expense", value: "expense", desc: "Outflow from wallet" },
    { label: "Income", value: "income", desc: "Inflow to wallet" },
    { label: "Transfer In", value: "transfer-in", desc: "Incoming transfer" },
    { label: "Transfer Out", value: "transfer-out", desc: "Outgoing transfer" },
    { label: "Investment", value: "investment", desc: "Capital investment" },
    { label: "Other", value: "other", desc: "Miscellaneous" },
];

export const CreateTransactionModal: React.FC<CreateTransactionModalProps> = ({
    isOpen,
    onClose,
    onTransactionCreated,
}) => {
    // Form fields matching CreateTransactionRequestDTO
    const [amount, setAmount] = useState<number | "">("");
    const [date, setDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    );
    const [description, setDescription] = useState("");
    const [type, setType] = useState("expense");
    const [walletId, setWalletId] = useState("");
    const [destinationWalletId, setDestinationWalletId] = useState("");
    const [contactId, setContactId] = useState("");
    const [items, setItems] = useState<TransactionItem[]>([
        { name: "", quantity: 1, price: 0, total: 0 },
    ]);
    const [tagsInput, setTagsInput] = useState("");

    // Lookups
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [contacts, setContacts] = useState<ContactResponse[]>([]);
    const [availableTags, setAvailableTags] = useState<TagResponse[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Nested modal states
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);

    // Fetch Wallets, Contacts, and Tags when modal opens
    useEffect(() => {
        if (!isOpen) return;

        const loadOptions = async () => {
            setLoadingData(true);
            try {
                const [walletsData, contactsData, tagsData] = await Promise.all([
                    walletService.listWallets(),
                    contactService.listContacts(),
                    tagService.listTags(),
                ]);
                setWallets(walletsData || []);
                setContacts(contactsData || []);
                setAvailableTags(tagsData || []);
                if (walletsData && walletsData.length > 0 && !walletId) {
                    setWalletId(walletsData[0].id);
                }
            } catch (err: unknown) {
                console.error("Error loading dropdown data:", err);
                toast.error("Failed to load wallets, contacts, or tags");
            } finally {
                setLoadingData(false);
            }
        };

        loadOptions();
    }, [isOpen, walletId]);

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

        // Auto calculate total amount from items sum if non-zero
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

        if (!walletId) {
            toast.error("Please select a wallet");
            return;
        }

        if (type.startsWith("transfer") && !destinationWalletId) {
            toast.error("Destination wallet is required for transfer transactions");
            return;
        }

        if (type.startsWith("transfer") && walletId === destinationWalletId) {
            toast.error("Source and destination wallet cannot be the same");
            return;
        }

        const numericAmount = typeof amount === "number" ? amount : parseFloat(amount);
        if (!numericAmount || numericAmount <= 0) {
            toast.error("Amount must be greater than zero");
            return;
        }

        // Validate line items
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

        try {
            const payload: CreateTransactionRequest = {
                amount: numericAmount,
                date: date, // expects YYYY-MM-DD string
                description: description.trim() || undefined,
                type: type,
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

            await transactionService.createTransaction(payload);
            toast.success("Transaction recorded successfully!");
            onClose();
            onTransactionCreated();
            resetForm();
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to create transaction";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setAmount("");
        setDescription("");
        setType("expense");
        setDestinationWalletId("");
        setContactId("");
        setItems([{ name: "", quantity: 1, price: 0, total: 0 }]);
        setTagsInput("");
    };

    const reloadContacts = async () => {
        try {
            const updatedContacts = await contactService.listContacts();
            setContacts(updatedContacts || []);
        } catch (err) {
            console.error("Failed to refresh contacts", err);
        }
    };

    const fieldCls = "mt-1 block w-full rounded-xl border border-border bg-surface-secondary px-3.5 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-150";
    const labelCls = "block text-xs font-semibold uppercase tracking-wider text-foreground-muted";

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-md">
                            <Receipt className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">New Transaction</h3>
                            <p className="text-xs text-foreground-muted">Record income, expenses, or transfers.</p>
                        </div>
                    </div>

                    {loadingData ? (
                        <div className="flex py-12 justify-center items-center gap-2 text-sm text-foreground-muted">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading form options...
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

                            {/* Wallet Selection */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>
                                        {type.startsWith("transfer") ? "Source Wallet *" : "Wallet *"}
                                    </label>
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

                                {type.startsWith("transfer") ? (
                                    <div>
                                        <label className={labelCls}>Destination Wallet *</label>
                                        <select
                                            value={destinationWalletId}
                                            onChange={(e) => setDestinationWalletId(e.target.value)}
                                            required
                                            className={fieldCls}
                                        >
                                            <option value="">Select destination wallet</option>
                                            {wallets.map((w) => (
                                                <option key={w.id} value={w.id}>
                                                    {w.name} ({w.currency})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <label className={labelCls}>Contact / Vendor</label>
                                            <button
                                                type="button"
                                                onClick={() => setIsContactModalOpen(true)}
                                                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                                            >
                                                <UserPlus className="h-3 w-3" /> New Contact
                                            </button>
                                        </div>
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
                                )}
                            </div>

                            {/* Total Amount & Description */}
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

                            {/* Line Items Section */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
                                        <Receipt className="h-3.5 w-3.5 text-primary" /> Itemized Breakdown *
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
                                                    placeholder="Item name / description"
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
                                                    className="p-1 text-foreground-muted hover:text-danger transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tags Input & Pre-defined Tags Chips */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <label className={labelCls}>Tags</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsTagModalOpen(true)}
                                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                        <Plus className="h-3 w-3" /> New Tag
                                    </button>
                                </div>
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

                                {availableTags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                        <span className="text-[10px] font-semibold text-foreground-muted mr-1">Quick Select:</span>
                                        {availableTags.map((tag) => {
                                            const activeList = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
                                            const isSelected = activeList.includes(tag.name);
                                            return (
                                                <button
                                                    key={tag.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setTagsInput(activeList.filter((t) => t !== tag.name).join(", "));
                                                        } else {
                                                            setTagsInput([...activeList, tag.name].join(", "));
                                                        }
                                                    }}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                                                        isSelected
                                                            ? "bg-primary text-white border-primary"
                                                            : "bg-surface-secondary text-foreground-muted border-border hover:border-primary/40"
                                                    }`}
                                                >
                                                    <Tag className="h-2.5 w-2.5" /> {tag.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
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
                                    className="rounded-xl bg-primary px-6 text-white hover:bg-primary-hover flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                                >
                                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Create Transaction
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </Modal>

            {/* Nested Modal for Inline Contact Creation */}
            <CreateContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                onContactCreated={reloadContacts}
            />

            {/* Nested Modal for Inline Tag Creation */}
            <CreateTagModal
                isOpen={isTagModalOpen}
                onClose={() => setIsTagModalOpen(false)}
                onTagCreated={async () => {
                    const updatedTags = await tagService.listTags();
                    setAvailableTags(updatedTags || []);
                }}
            />
        </>
    );
};
