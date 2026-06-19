import { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";

import { Toaster } from "react-hot-toast";
import QueryProvider from "@/components/providers/QueryProvider";

const inter = Inter({
    subsets: ["latin"],
});

const interTight = Inter_Tight({
    subsets: ["latin"],
    variable: "--font-inter-tight",
});

export const metadata: Metadata = {
    title: {
        default: "Moniq | Personal Expense Tracker",
        template: "%s | Moniq",
    },
    description:
        "Monitor your family ledgers, track expenses, and manage your budget with Moniq.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} ${interTight.variable} dark:bg-background`}>
                <AuthProvider>
                    <QueryProvider>
                        <ThemeProvider>
                            <SidebarProvider>
                                {/* <SocketProvider>{children}</SocketProvider> */}
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
                </AuthProvider>
            </body>
        </html>
    );
}
