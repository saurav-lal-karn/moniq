"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";

export default function ResetPasswordForm() {
    const [email, setEmail] = useState("");
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate sending reset link
        setIsSent(true);
    };

    return (
        <div className="flex min-h-screen w-full flex-1 flex-col bg-background text-foreground lg:w-1/2">
            <div className="mx-auto mb-5 w-full max-w-md px-4 sm:px-0 sm:pt-10">
                <Link
                    href="/signin"
                    className="group inline-flex items-center text-sm text-muted transition-colors hover:text-foreground"
                >
                    <ChevronLeftIcon className="transition-transform group-hover:-translate-x-1" />
                    Back to sign in
                </Link>
            </div>

            <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 sm:px-0">
                <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-theme-xl">
                    {!isSent ? (
                        <>
                            <div className="mb-8">
                                <h1 className="mb-2 text-3xl font-black tracking-tight text-foreground">
                                    Reset{" "}
                                    <span className="text-primary italic">
                                        Password
                                    </span>
                                </h1>
                                <p className="text-sm text-muted">
                                    Enter your email address and we'll send you
                                    a link to reset your password.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label className="mb-2 block text-xs font-bold tracking-wider text-muted uppercase">
                                        Email Address
                                    </Label>
                                    <Input
                                        placeholder="name@example.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className="w-full rounded-xl border-border bg-surface-secondary text-foreground transition-all placeholder:text-muted focus:border-primary"
                                        required
                                    />
                                </div>

                                <div>
                                    <Button
                                        type="submit"
                                        className="w-full rounded-xl bg-primary py-4 text-lg font-black text-white shadow-theme-md transition-all hover:bg-primary-hover"
                                    >
                                        Send Reset Link
                                    </Button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="py-10 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
                                <svg
                                    className="h-10 w-10 text-primary"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h2 className="mb-4 text-2xl font-black text-foreground">
                                Check your email
                            </h2>
                            <p className="mb-8 text-muted">
                                We've sent a password reset link to <br />
                                <span className="font-bold text-foreground">
                                    {email}
                                </span>
                            </p>
                            <button
                                onClick={() => setIsSent(false)}
                                className="font-bold text-primary transition-colors hover:text-primary-hover"
                            >
                                Didn't receive it? Try again
                            </button>
                        </div>
                    )}

                    <div className="mt-8 border-t border-border pt-8 text-center">
                        <p className="text-sm font-medium text-muted">
                            Remember your password? {""}
                            <Link
                                href="/signin"
                                className="font-black text-primary transition-colors hover:text-primary-hover"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
