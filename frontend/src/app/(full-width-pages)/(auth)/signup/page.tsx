import { Suspense } from "react";
import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up | Moniq",
    description:
        "Create a Moniq account to start tracking your family budget.",
};

export default function SignUp() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background" />}>
            <SignUpForm />
        </Suspense>
    );
}
