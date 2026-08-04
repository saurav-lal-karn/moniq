"use client";
import Image from "next/image";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useAuth } from "@/context/AuthContext";
import {
    UserCircle,
    Settings,
    LifeBuoy,
    LogOut,
    ChevronDown,
} from "lucide-react";

export default function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();

    function toggleDropdown(
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    }

    function closeDropdown() {
        setIsOpen(false);
    }

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        await logout();
        closeDropdown();
    };

    const getAvatarUrl = (url?: string) => {
        if (!url) return "/images/user/owner.jpg";
        if (url.startsWith("http")) return url;
        // Construct full URL
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3080";
        try {
            const urlObj = new URL(apiUrl);
            return `${urlObj.origin}${url}`;
        } catch {
            return url;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="group flex items-center gap-3 rounded-2xl p-1.5 transition-colors hover:bg-surface-secondary"
            >
                <div className="h-10 w-10 overflow-hidden rounded-xl border-2 border-transparent transition-all group-hover:border-primary/20">
                    <Image
                        width={40}
                        height={40}
                        src={getAvatarUrl(user?.avatar_url)}
                        alt="User"
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="hidden text-left md:block">
                    <p className="mb-1 text-sm leading-none font-black text-foreground">
                        {user?.first_name || "Saurav"}
                    </p>
                    <p className="text-[10px] font-bold tracking-widest text-foreground-muted uppercase">
                        {user?.role || "Family Owner"}
                    </p>
                </div>

                <ChevronDown
                    className={`h-4 w-4 text-foreground-muted transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            <Dropdown
                isOpen={isOpen}
                onClose={closeDropdown}
                className="animate-in fade-in zoom-in-95 absolute right-0 mt-4 w-[280px] rounded-3xl border border-border bg-surface p-3 shadow-2xl shadow-black/10 duration-200"
            >
                <div className="mb-2 rounded-2xl border-b border-border bg-surface-secondary/50 px-3 py-4">
                    <p className="text-sm font-black text-foreground">
                        {user
                            ? `${user.first_name} ${user.last_name}`
                            : "Saurav Karn"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-foreground-muted">
                        {user?.email || "saurav@example.com"}
                    </p>
                </div>

                <div className="space-y-1">
                    <DropdownItem
                        onItemClick={closeDropdown}
                        tag="a"
                        href="/profile"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-foreground-muted transition-all hover:bg-primary-soft hover:text-primary"
                    >
                        <UserCircle className="h-5 w-5" />
                        Edit Profile
                    </DropdownItem>

                    <DropdownItem
                        onItemClick={closeDropdown}
                        tag="a"
                        href="/settings"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-foreground-muted transition-all hover:bg-primary-soft hover:text-primary"
                    >
                        <Settings className="h-5 w-5" />
                        Account Settings
                    </DropdownItem>

                    <DropdownItem
                        onItemClick={closeDropdown}
                        tag="a"
                        href="/support"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-foreground-muted transition-all hover:bg-primary-soft hover:text-primary"
                    >
                        <LifeBuoy className="h-5 w-5" />
                        Support Hub
                    </DropdownItem>
                </div>

                <div className="mt-2 border-t border-border pt-2">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-danger transition-all hover:bg-danger/10"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </Dropdown>
        </div>
    );
}
