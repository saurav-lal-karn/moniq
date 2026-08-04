import { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

import { Toaster } from "react-hot-toast";
import QueryProvider from "@/components/providers/QueryProvider";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-jakarta",
});

export const metadata: Metadata = {
    title: {
        default: "Moniq | Financial Intelligence for Personal & Teams",
        template: "%s | Moniq",
    },
    description:
        "Unified financial platform to track wallets, monitor budgets, scan receipts, and manage family & team ledgers with complete clarity.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${plusJakarta.variable} font-sans bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary`}>
                <AuthProvider>
                    <WorkspaceProvider>
                        <QueryProvider>
                            <ThemeProvider>
                                <SidebarProvider>
                                    <Toaster
                                        position="top-right"
                                        containerStyle={{
                                            zIndex: 100000,
                                        }}
                                    />
                                    {children}
                                </SidebarProvider>
                            </ThemeProvider>
                        </QueryProvider>
                    </WorkspaceProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
