"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function SignInForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await login({ email, password });
        } catch (err: any) {
            setError(
                err.message ||
                "Failed to sign in. Please check your credentials."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-1 flex-col bg-background text-foreground lg:w-1/2">
            <div className="mx-auto mb-5 w-full max-w-md px-4 sm:px-0 sm:pt-10">
                <Link
                    href="/"
                    className="group inline-flex items-center text-sm text-muted transition-colors hover:text-foreground"
                >
                    <ChevronLeftIcon className="transition-transform group-hover:-translate-x-1" />
                    Back to home
                </Link>
            </div>

            <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 sm:px-0">
                <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-theme-xl">
                    <div className="mb-8">
                        <h1 className="mb-2 text-3xl font-black tracking-tight text-foreground">
                            Welcome{" "}
                            <span className="text-primary italic">Back</span>
                        </h1>
                        <p className="text-sm text-muted">
                            Sign in to manage your family ledgers.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <button className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface-secondary py-3 text-sm font-semibold transition-all hover:bg-surface">
                                <Image
                                    src="/images/icon/google.png"
                                    alt="Google"
                                    width={18}
                                    height={18}
                                />
                                Google
                            </button>
                            <button className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface-secondary py-3 text-sm font-semibold transition-all hover:bg-surface">
                                <span className="text-muted">X</span>
                                Coming Soon
                            </button>
                        </div>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-border"></div>
                            <span className="mx-4 flex-shrink text-xs font-bold tracking-widest text-muted uppercase">
                                Or
                            </span>
                            <div className="flex-grow border-t border-border"></div>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
                                    {error}
                                </div>
                            )}
                            <div>
                                <Label className="mb-2 block text-xs font-bold tracking-wider text-muted uppercase">
                                    Email Address
                                </Label>
                                <Input
                                    placeholder="name@example.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="rounded-xl border-border bg-surface-secondary text-foreground transition-all placeholder:text-muted focus:border-primary"
                                    required
                                />
                            </div>

                            <div>
                                <Label className="mb-2 block text-xs font-bold tracking-wider text-muted uppercase">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        className="rounded-xl border-border bg-surface-secondary text-foreground transition-all placeholder:text-muted focus:border-primary"
                                        required
                                    />
                                    <span
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer text-muted transition-colors hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeIcon />
                                        ) : (
                                            <EyeCloseIcon />
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={isChecked}
                                        onChange={setIsChecked}
                                        className="rounded-md border-border"
                                    />
                                    <span className="font-medium text-muted">
                                        Keep me logged in
                                    </span>
                                </div>
                                <Link
                                    href="/reset-password"
                                    className="font-bold text-primary transition-colors hover:text-primary-hover"
                                >
                                    Forgot?
                                </Link>
                            </div>

                            <div>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full rounded-xl bg-primary py-4 text-lg font-black text-white shadow-theme-md transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? "Signing In..." : "Sign In"}
                                </Button>
                            </div>
                        </form>

                        <p className="text-center text-sm font-medium text-muted">
                            Don&apos;t have an account? {""}
                            <Link
                                href="/signup"
                                className="font-black text-primary transition-colors hover:text-primary-hover"
                            >
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
