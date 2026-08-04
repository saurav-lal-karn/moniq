import { Suspense } from "react";
import { Metadata } from "next";
import InvitationView from "@/components/invitation/InvitationView";

export const metadata: Metadata = {
    title: "Workspace Invitation — Moniq",
    description: "Accept or decline your workspace invitation to Moniq.",
};

export default function InvitationPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-foreground-muted">Loading invitation...</div>}>
            <InvitationView />
        </Suspense>
    );
}
