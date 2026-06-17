import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reset Password",
    description:
        "Reset your Moniq password to regain access to your account.",
};

export default function ResetPassword() {
    return <ResetPasswordForm />;
}
