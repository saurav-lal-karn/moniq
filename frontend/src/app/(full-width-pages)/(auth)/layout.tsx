import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative z-1 bg-background p-6 sm:p-0">
            <ThemeProvider>
                <div className="relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row bg-background">
                    {children}
                    <div className="bg-surface-secondary hidden h-full w-full items-center lg:grid lg:w-1/2">
                        <div className="relative z-1 flex items-center justify-center">
                            {/* <!-- ===== Common Grid Shape Start ===== --> */}
                            <GridShape />
                            <div className="flex max-w-xs flex-col items-center">
                                <Link href="/" className="mb-4 block">
                                    <Image
                                        width={231}
                                        height={48}
                                        src="/images/logo/logo-dark.png"
                                        alt="Logo"
                                    />
                                </Link>
                                <p className="text-center text-muted">
                                    Secure family-ledger for managing your
                                    household budget and tracking every penny.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="fixed right-6 bottom-6 z-50 hidden sm:block">
                        <ThemeTogglerTwo />
                    </div>
                </div>
            </ThemeProvider>
        </div>
    );
}
