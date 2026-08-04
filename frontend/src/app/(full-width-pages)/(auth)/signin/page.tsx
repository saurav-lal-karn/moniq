import { Suspense } from "react";
import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In | Moniq",
    description:
        "Sign in to your Moniq account to manage your family expenses.",
};

export default function SignIn() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background" />}>
            <SignInForm />
        </Suspense>
    );
}
