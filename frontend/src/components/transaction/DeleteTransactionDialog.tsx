"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { transactionService, TransactionResponse } from "@/services/transactionService";
import { toast } from "react-hot-toast";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface DeleteTransactionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: TransactionResponse | null;
    onTransactionDeleted?: () => void;
}

export const DeleteTransactionDialog: React.FC<DeleteTransactionDialogProps> = ({
    isOpen,
    onClose,
    transaction,
    onTransactionDeleted,
}) => {
    const [deleting, setDeleting] = useState(false);

    if (!transaction) return null;

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await transactionService.deleteTransaction(transaction.id);
            toast.success("Transaction deleted successfully!");
            if (onTransactionDeleted) onTransactionDeleted();
            onClose();
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to delete transaction";
            toast.error(msg);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 mb-4">
                    <AlertTriangle className="h-7 w-7" />
                </div>

                <h3 className="text-xl font-bold text-foreground">Delete Transaction?</h3>
                <p className="mt-2 text-sm text-foreground-muted">
                    Are you sure you want to delete transaction{" "}
                    <span className="font-semibold text-foreground">
                        {transaction.description ? `"${transaction.description}"` : `#${transaction.id.slice(0, 8)}`}
                    </span>{" "}
                    for <span className="font-semibold text-rose-600">${transaction.amount.toFixed(2)}</span>?
                </p>
                <p className="mt-1 text-xs text-foreground-muted">
                    This action cannot be undone.
                </p>

                <div className="mt-6 flex items-center justify-center gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-rose-700 flex items-center gap-2"
                    >
                        {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        Delete Transaction
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
