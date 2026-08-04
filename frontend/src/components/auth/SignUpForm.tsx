"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignUpForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { signup } = useAuth();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callback");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isChecked) {
            setError(
                "Please agree to the Terms of Service and Privacy Policy."
            );
            return;
        }
        setError(null);
        setIsSubmitting(true);

        try {
            await signup({ first_name: firstName, last_name: lastName, email, password }, callbackUrl || undefined);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to create account. Please try again.";
            setError(msg);
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

            <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-0">
                <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-theme-xl">
                    <div className="mb-8">
                        <h1 className="mb-2 text-3xl font-black tracking-tight text-foreground">
                            Create{" "}
                            <span className="text-primary italic">
                                Account
                            </span>
                        </h1>
                        <p className="text-sm text-muted">
                            Start your journey to financial freedom today.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {error && (
                                <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
                                    {error}
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <Label className="mb-2 block text-xs font-bold tracking-wider text-muted uppercase">
                                        First Name
                                    </Label>
                                    <Input
                                        placeholder="Saurav"
                                        type="text"
                                        value={firstName}
                                        onChange={(e) =>
                                            setFirstName(e.target.value)
                                        }
                                        className="rounded-xl border-border bg-surface-secondary text-foreground transition-all placeholder:text-muted focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-xs font-bold tracking-wider text-muted uppercase">
                                        Last Name
                                    </Label>
                                    <Input
                                        placeholder="Karn"
                                        type="text"
                                        value={lastName}
                                        onChange={(e) =>
                                            setLastName(e.target.value)
                                        }
                                        className="rounded-xl border-border bg-surface-secondary text-foreground transition-all placeholder:text-muted focus:border-primary"
                                        required
                                    />
                                </div>
                            </div>

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

                            <div className="flex items-start gap-3 py-2">
                                <Checkbox
                                    checked={isChecked}
                                    onChange={setIsChecked}
                                    className="mt-1 rounded-md border-border"
                                />
                                <p className="text-xs leading-relaxed font-medium text-muted">
                                    By signing up, you agree to our{" "}
                                    <Link
                                        href="#"
                                        className="text-primary hover:underline"
                                    >
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link
                                        href="#"
                                        className="text-primary hover:underline"
                                    >
                                        Privacy Policy
                                    </Link>
                                    .
                                </p>
                            </div>

                            <div>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full rounded-xl bg-primary py-4 text-lg font-black text-white shadow-theme-md transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? "Signing Up..." : "Sign Up"}
                                </Button>
                            </div>
                        </form>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-border"></div>
                            <span className="mx-4 flex-shrink text-xs font-bold tracking-widest text-muted uppercase">
                                Or
                            </span>
                            <div className="flex-grow border-t border-border"></div>
                        </div>

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

                        <p className="text-center text-sm font-medium text-muted">
                            Already have an account? {""}
                            <Link
                                href={callbackUrl ? `/signin?callback=${encodeURIComponent(callbackUrl)}` : "/signin"}
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
