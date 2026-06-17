"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight,
    ScanText,
    BarChart3,
    Users,
    Shield,
    PieChart,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LandingPageClient() {
    const { isAuthenticated, loading } = useAuth();

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary-soft">
            {/* Navbar */}
            <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/images/logo/logo-dark.png"
                                alt="Moniq Logo"
                                width={180}
                                height={50}
                                className="h-10 w-auto dark:invert"
                            />
                        </div>
                        <div className="hidden items-center gap-8 font-medium text-muted md:flex">
                            <a
                                href="#features"
                                className="transition-colors hover:text-foreground"
                            >
                                Features
                            </a>
                            <a
                                href="#about"
                                className="transition-colors hover:text-foreground"
                            >
                                About
                            </a>
                            {!loading &&
                                (isAuthenticated ? (
                                    <Link
                                        href="/dashboard"
                                        className="transform rounded-full bg-primary px-5 py-2.5 font-bold text-white shadow-theme-md transition-all hover:scale-105 hover:bg-primary-hover active:scale-95"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/signin"
                                            className="transition-colors hover:text-foreground"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/signup"
                                            className="transform rounded-full bg-foreground px-5 py-2.5 font-bold text-background shadow-theme-md transition-all hover:scale-105 hover:opacity-90 active:scale-95"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
                <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary px-3 py-1 backdrop-blur-sm">
                        <span className="flex h-2 w-2 animate-pulse rounded-full bg-success" />
                        <span className="text-sm font-medium text-primary">
                            AI-Powered Family Finance
                        </span>
                    </div>

                    <h1 className="mb-8 text-5xl leading-[1.1] font-black tracking-tight md:text-7xl lg:text-8xl">
                        Your Family's{" "}
                        <span className="text-primary italic">
                            Trusted
                        </span>{" "}
                        Ledger.
                    </h1>

                    <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
                        Take control of your household budget, seamlessly scan receipts with AI, and track shared expenses with complete clarity.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        {!loading &&
                            (isAuthenticated ? (
                                <Link
                                    href="/dashboard"
                                    className="group flex w-full transform items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-theme-lg transition-all hover:scale-105 hover:bg-primary-hover sm:w-auto"
                                >
                                    Go to Dashboard{" "}
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/signup"
                                        className="group flex w-full transform items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-theme-lg transition-all hover:scale-105 hover:bg-primary-hover sm:w-auto"
                                    >
                                        Start Your Ledger{" "}
                                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <Link
                                        href="/dashboard"
                                        className="flex w-full items-center justify-center rounded-2xl border border-border bg-surface px-8 py-4 text-lg font-bold shadow-theme-xs backdrop-blur-sm transition-all hover:bg-surface-secondary sm:w-auto"
                                    >
                                        View Demo
                                    </Link>
                                </>
                            ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative bg-surface-secondary py-24 border-y border-border">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-20 text-center">
                        <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                            Everything you need to save
                        </h2>
                        <p className="text-lg text-muted">
                            Professional tools to manage complex family finances with ease.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: "Smart Receipt OCR",
                                desc: "Instantly scan and extract data from receipts using advanced AI. No more manual entry.",
                                icon: (
                                    <ScanText className="h-10 w-10 text-primary" />
                                ),
                            },
                            {
                                title: "Family Sync",
                                desc: "Share ledgers with family members and track joint expenses securely in real-time.",
                                icon: (
                                    <Users className="h-10 w-10 text-secondary" />
                                ),
                            },
                            {
                                title: "Budget Analytics",
                                desc: "Get automated reports and beautiful visualizations to understand your spending patterns.",
                                icon: (
                                    <BarChart3 className="h-10 w-10 text-accent" />
                                ),
                            },
                            {
                                title: "Category Limits",
                                desc: "Set monthly limits for categories and receive gentle alerts before you overspend.",
                                icon: (
                                    <PieChart className="h-10 w-10 text-primary-hover" />
                                ),
                            },
                            {
                                title: "Bank-Grade Security",
                                desc: "Your financial data is encrypted and secure with modern authentication standards.",
                                icon: (
                                    <Shield className="h-10 w-10 text-success" />
                                ),
                            },
                            {
                                title: "Export & Reporting",
                                desc: "Download your transaction history in CSV or PDF formats whenever you need it.",
                                icon: (
                                    <ArrowRight className="h-10 w-10 text-muted" />
                                ),
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group rounded-3xl border border-border bg-surface p-8 shadow-theme-xs transition-all hover:border-primary-soft hover:bg-surface-secondary"
                            >
                                <div className="mb-6 transform transition-transform duration-300 group-hover:scale-110">
                                    {feature.icon}
                                </div>
                                <h3 className="mb-3 text-2xl font-bold">
                                    {feature.title}
                                </h3>
                                <p className="leading-relaxed text-muted">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden py-20 bg-background">
                <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-[2rem] border border-border bg-surface p-12 text-center shadow-theme-lg md:p-20">
                        <h2 className="mb-8 text-4xl font-black md:text-6xl">
                            Ready to master your{" "}
                            <span className="text-primary">budget</span>?
                        </h2>
                        <p className="mx-auto mb-12 max-w-2xl text-xl text-muted">
                            Join families who use Moniq to stay
                            on top of their finances and reach their savings
                            goals faster.
                        </p>
                        {!loading &&
                            (isAuthenticated ? (
                                <Link
                                    href="/dashboard"
                                    className="transform rounded-2xl bg-foreground px-10 py-5 text-xl font-black text-background shadow-theme-md transition-all hover:scale-105 hover:opacity-90"
                                >
                                    Open Your Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/signup"
                                    className="transform rounded-2xl bg-foreground px-10 py-5 text-xl font-black text-background shadow-theme-md transition-all hover:scale-105 hover:opacity-90"
                                >
                                    Start for Free
                                </Link>
                            ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border bg-background py-12">
                <div className="md:row mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/images/logo/logo-dark.png"
                            alt="Moniq Logo"
                            width={140}
                            height={40}
                            className="h-8 w-auto dark:invert"
                        />
                    </div>
                    <p className="text-sm text-muted">
                        © 2026 Moniq Finance. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-muted">
                        <a href="#" className="hover:text-foreground">
                            Privacy
                        </a>
                        <a href="#" className="hover:text-foreground">
                            Terms
                        </a>
                        <a href="#" className="hover:text-foreground">
                            Twitter
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
