import { Metadata } from "next";
import InvitationView from "@/components/invitation/InvitationView";

export const metadata: Metadata = {
    title: "Workspace Invitation — Moniq",
    description: "Accept or decline your workspace invitation to Moniq.",
};

export default function InvitationPage() {
    return <InvitationView />;
}
