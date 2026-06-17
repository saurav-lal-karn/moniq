import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up",
    description:
        "Create a Moniq account to start tracking your family budget.",
};

export default function SignUp() {
    return <SignUpForm />;
}
