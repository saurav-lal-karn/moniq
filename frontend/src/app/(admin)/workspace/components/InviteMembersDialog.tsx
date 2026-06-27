import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useState } from "react";


export default function InviteMembersDialog({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: ({ email, role }: { email: string, role: string }) => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [role, setRole] = useState("member")
    const [email, setEmail] = useState("")

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        onSubmit({ email, role })
        setIsSubmitting(false)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px]">
            <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Invite Members</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Invitations sent to users to join this workspace.</p>
                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                                placeholder="email address"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="role" className="text-sm font-medium">Role</label>
                            <select id="role" className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" onChange={(e) => setRole(e.target.value)}>
                                <option value="member">Member</option>
                                <option value="owner">Owner</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Inviting..." : "Invite"}</Button>
                    </div>
                </form>
            </div>
        </Modal>
    )
}