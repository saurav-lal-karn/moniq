import MembersList from "./components/MembersList";
import InvitationsList from "./components/InvitationsList";

export default function Workspace() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Workspace Management</h2>
                <p className="text-muted-foreground mt-2 text-gray-500">
                    Manage your workspace members and invitations here.
                </p>
            </div>
            <MembersList />
            <InvitationsList />
        </div>
    );
}