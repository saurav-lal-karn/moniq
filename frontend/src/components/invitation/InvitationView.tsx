"use client";

import { useEffect, useState, useCallback, JSX } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3080/api";

type Status = "idle" | "loading" | "accepted" | "declined" | "expired" | "error";

async function respondToInvitation(action: "accept" | "decline", token: string) {
    const endpoint = action === "accept" ? "/invitation/accept" : "/invitation/decline";
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
    });

    if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    const result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || "Something went wrong.");
    }
    return result;
}

type InvitationDetails = {
    workspace_name: string;
    inviter_name: string;
    role: string;
    email: string;
};

export default function InvitationView() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState<string>("");
    const [details, setDetails] = useState<InvitationDetails | null>(null);

    // If no token in URL, show error immediately
    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("This invitation link is invalid or has expired.");
            return;
        }

        async function fetchDetails() {
            try {
                const response = await fetch(`${API_URL}/invitation/details?token=${token}`);
                const result = await response.json();
                if (response.ok && result.data) {
                    setDetails(result.data);
                } else {
                    setStatus("error");
                    setMessage(result.message || "Failed to load invitation details.");
                }
            } catch (err) {
                setStatus("error");
                setMessage("Network error. Please try again later.");
            }
        }
        fetchDetails();
    }, [token]);

    const handleAction = useCallback(
        async (action: "accept" | "decline") => {
            if (!token) return;
            setStatus("loading");
            try {
                await respondToInvitation(action, token);
                setStatus(action === "accept" ? "accepted" : "declined");
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
                if (msg === "UNAUTHORIZED") {
                    const callback = encodeURIComponent(`/invitation?token=${token}`);
                    router.push(`/signup?callback=${callback}`);
                    return;
                }
                const lowerMsg = msg.toLowerCase();
                if (lowerMsg.includes("expired") || lowerMsg.includes("invalid")) {
                    setStatus("expired");
                    setMessage(msg);
                } else {
                    setStatus("error");
                    setMessage(msg);
                }
            }
        },
        [token]
    );

    return (
        <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
            {/* Background decorative blobs */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(31,111,94,0.12) 0%, transparent 70%)",
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-40 -bottom-40 h-[600px] w-[600px] rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(193,138,67,0.10) 0%, transparent 70%)",
                }}
            />

            <div className="relative z-10 w-full max-w-md px-4 py-12">
                {/* Logo */}
                <div className="mb-10 flex justify-center">
                    <Link href="/">
                        <Image
                            src="/images/logo/logo-dark.png"
                            alt="Moniq"
                            width={140}
                            height={30}
                            priority
                        />
                    </Link>
                </div>

                {/* Card */}
                <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-theme-xl">
                    {status === "idle" && token && details && (
                        <IdleState onAction={handleAction} details={details} />
                    )}
                    {status === "loading" && <LoadingState />}
                    {status === "accepted" && (
                        <ResultState
                            type="success"
                            headline="You're in! 🎉"
                            body="The workspace has been added to your account. Head to your dashboard to get started."
                            actionLabel="Go to Dashboard"
                            onAction={() => router.push("/dashboard")}
                        />
                    )}
                    {status === "declined" && (
                        <ResultState
                            type="neutral"
                            headline="Invitation Declined"
                            body="You've declined this workspace invitation. You can always ask the workspace admin to send a new one."
                            actionLabel="Back to Home"
                            onAction={() => router.push("/")}
                        />
                    )}
                    {status === "expired" && (
                        <ResultState
                            type="warning"
                            headline="Link Expired"
                            body={message || "This invitation link has expired. Please ask the workspace admin to resend the invitation."}
                            actionLabel="Go to Sign In"
                            onAction={() => router.push("/signin")}
                        />
                    )}
                    {status === "error" && (
                        <ResultState
                            type="danger"
                            headline="Something went wrong"
                            body={message || "This invitation link is invalid. Please check your email and try again."}
                            actionLabel="Go to Sign In"
                            onAction={() => router.push("/signin")}
                        />
                    )}
                </div>

                <p className="mt-8 text-center text-xs text-muted">
                    Having trouble?{" "}
                    <Link href="mailto:support@moniq.app" className="text-primary hover:underline">
                        Contact Support
                    </Link>
                </p>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────── */
/*  Sub-components                                     */
/* ─────────────────────────────────────────────────── */

function IdleState({
    onAction,
    details,
}: {
    onAction: (action: "accept" | "decline") => void;
    details: InvitationDetails;
}) {
    return (
        <div className="space-y-6 text-center">
            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft">
                <WorkspaceIcon />
            </div>

            <div className="space-y-2">
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                    You&apos;ve been invited
                </h1>
                <p className="text-sm leading-relaxed text-muted">
                    <span className="font-semibold text-foreground">{details.inviter_name}</span> has invited you to join the{" "}
                    <span className="font-semibold text-foreground">{details.workspace_name}</span> workspace on{" "}
                    <span className="font-semibold text-foreground">Moniq</span> as a <span className="font-semibold">{details.role}</span>.
                    Accept to collaborate with your team, or decline if this wasn&apos;t meant for you.
                </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
                <button
                    id="accept-invitation-btn"
                    onClick={() => onAction("accept")}
                    className="group relative w-full overflow-hidden rounded-xl bg-primary py-4 text-base font-black text-white shadow-theme-md transition-all duration-200 hover:bg-primary-hover hover:shadow-theme-lg active:scale-[0.98]"
                >
                    <span className="relative z-10">Accept Invitation</span>
                    {/* Shimmer on hover */}
                    <span
                        aria-hidden="true"
                        className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-full skew-x-12"
                    />
                </button>

                <button
                    id="decline-invitation-btn"
                    onClick={() => onAction("decline")}
                    className="w-full rounded-xl border border-border bg-transparent py-3.5 text-sm font-semibold text-muted transition-all duration-200 hover:border-danger/50 hover:bg-danger/5 hover:text-danger active:scale-[0.98]"
                >
                    Decline Invitation
                </button>
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex flex-col items-center gap-5 py-4 text-center">
            <div className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-20" />
                <span className="relative flex h-10 w-10 animate-spin items-center justify-center rounded-full border-2 border-primary border-t-transparent" />
            </div>
            <div>
                <p className="text-base font-semibold text-foreground">Processing…</p>
                <p className="mt-1 text-sm text-muted">Please wait a moment.</p>
            </div>
        </div>
    );
}

type ResultType = "success" | "neutral" | "warning" | "danger";

const resultStyles: Record<
    ResultType,
    { icon: JSX.Element; iconBg: string; headingColor: string }
> = {
    success: {
        icon: <CheckIcon />,
        iconBg: "bg-success/10",
        headingColor: "text-success",
    },
    neutral: {
        icon: <XIcon />,
        iconBg: "bg-surface-secondary",
        headingColor: "text-foreground",
    },
    warning: {
        icon: <ClockIcon />,
        iconBg: "bg-warning/10",
        headingColor: "text-warning",
    },
    danger: {
        icon: <AlertIcon />,
        iconBg: "bg-danger/10",
        headingColor: "text-danger",
    },
};

function ResultState({
    type,
    headline,
    body,
    actionLabel,
    onAction,
}: {
    type: ResultType;
    headline: string;
    body: string;
    actionLabel: string;
    onAction: () => void;
}) {
    const styles = resultStyles[type];
    return (
        <div className="flex flex-col items-center gap-5 py-2 text-center">
            <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${styles.iconBg}`}
            >
                {styles.icon}
            </div>
            <div className="space-y-2">
                <h1 className={`text-xl font-black tracking-tight ${styles.headingColor}`}>
                    {headline}
                </h1>
                <p className="text-sm leading-relaxed text-muted">{body}</p>
            </div>
            <button
                onClick={onAction}
                className="mt-2 w-full rounded-xl bg-primary py-3.5 text-sm font-black text-white shadow-theme-md transition-all hover:bg-primary-hover active:scale-[0.98]"
            >
                {actionLabel}
            </button>
        </div>
    );
}

/* ─────────────────────────────────────────────────── */
/*  Icons (inline SVG to avoid extra imports)          */
/* ─────────────────────────────────────────────────── */

function WorkspaceIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function XIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function AlertIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}
