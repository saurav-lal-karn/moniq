import MembersList from "./components/MembersList";
import InvitationsList from "./components/InvitationsList";
import { Users } from "lucide-react";

export default function Workspace() {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Page header */}
            <div className="animate-fade-in-down">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                    <Users className="h-3.5 w-3.5" />
                    Team Management
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Workspace</h1>
                <p className="mt-1 text-sm text-foreground-muted max-w-md">
                    Manage team members, roles, and invitations for your active workspace.
                </p>
            </div>

            <div className="space-y-6 animate-fade-in-up delay-75">
                <MembersList />
                <InvitationsList />
            </div>
        </div>
    );
}