import React from "react";
import { Modal } from "@/components/ui/modal";
import { AlertCircle } from "lucide-react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<
    DeleteConfirmationModalProps
> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isDeleting = false,
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/10">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                </div>

                <h3 className="mb-2 text-xl font-black text-gray-900 dark:text-white">
                    {title}
                </h3>
                <p className="mb-8 max-w-xs text-sm text-gray-500 dark:text-gray-400">
                    {description}
                </p>

                <div className="flex w-full items-center gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
