"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { tagService } from "@/services/transactionService";
import { toast } from "react-hot-toast";
import { Tag as TagIcon, Loader2 } from "lucide-react";

interface CreateTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTagCreated: () => void;
}

export const CreateTagModal: React.FC<CreateTagModalProps> = ({
    isOpen,
    onClose,
    onTagCreated,
}) => {
    const [tagName, setTagName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tagName.trim()) {
            toast.error("Tag name is required");
            return;
        }

        setLoading(true);
        try {
            await tagService.createTag({ name: tagName.trim() });
            toast.success("Tag created successfully!");
            setTagName("");
            onClose();
            onTagCreated();
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to create tag";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const fieldCls = "mt-1 block w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-150";
    const labelCls = "block text-xs font-semibold uppercase tracking-wider text-foreground-muted";

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <TagIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Create New Tag</h3>
                        <p className="text-xs text-foreground-muted">Add a workspace tag to categorize transactions.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className={labelCls}>Tag Name *</label>
                        <input
                            type="text"
                            required
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                            placeholder="e.g. utilities, office, tax-deductible"
                            className={fieldCls}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
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
                            disabled={loading}
                            className="rounded-xl bg-primary px-5 text-white hover:bg-primary-hover flex items-center gap-2"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Create Tag
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
