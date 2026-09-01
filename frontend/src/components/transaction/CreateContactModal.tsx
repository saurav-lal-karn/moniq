"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
    contactService,
    ContactResponse,
    CreateContactRequest,
} from "@/services/transactionService";
import { toast } from "react-hot-toast";
import { UserCheck, Loader2 } from "lucide-react";

interface CreateContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContactCreated: (newContact?: ContactResponse) => void;
}

const CONTACT_TYPES = [
    { label: "Vendor", value: "vendor" },
    { label: "Client", value: "client" },
    { label: "Employee", value: "employee" },
    { label: "Lender", value: "lender" },
    { label: "Other", value: "other" },
];

export const CreateContactModal: React.FC<CreateContactModalProps> = ({
    isOpen,
    onClose,
    onContactCreated,
}) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [type, setType] = useState("vendor");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Contact name is required");
            return;
        }

        setLoading(true);
        try {
            const payload: CreateContactRequest = {
                name: name.trim(),
                email: email.trim() || undefined,
                phone: phone.trim() || undefined,
                address: address.trim() || undefined,
                type,
            };
            await contactService.createContact(payload);
            toast.success("Contact created successfully");
            setName("");
            setEmail("");
            setPhone("");
            setAddress("");
            setType("vendor");
            onClose();
            onContactCreated();
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to create contact";
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
                        <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Add New Contact</h3>
                        <p className="text-xs text-foreground-muted">Save vendor, client, or entity details.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelCls}>Contact Name *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Acme Corp, Jane Doe"
                            className={fieldCls}
                        />
                    </div>

                    <div>
                        <label className={labelCls}>Contact Type *</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className={fieldCls}
                        >
                            {CONTACT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="billing@acme.com"
                                className={fieldCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Phone</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1 234 567 890"
                                className={fieldCls}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Address</label>
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Optional office or street address..."
                            rows={2}
                            className={`${fieldCls} resize-none`}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
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
                            Create Contact
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
