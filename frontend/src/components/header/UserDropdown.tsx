"use client";
import Image from "next/image";
import Link from "next/link";
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
                className="group flex items-center gap-3 rounded-2xl p-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
                <div className="h-10 w-10 overflow-hidden rounded-xl border-2 border-transparent transition-all group-hover:border-blue-500/20">
                    <Image
                        width={40}
                        height={40}
                        src={getAvatarUrl(user?.avatar_url)}
                        alt="User"
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="hidden text-left md:block">
                    <p className="mb-1 text-sm leading-none font-black text-gray-900 dark:text-white">
                        {user?.first_name || "Saurav"}
                    </p>
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        {user?.role || "Family Owner"}
                    </p>
                </div>

                <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            <Dropdown
                isOpen={isOpen}
                onClose={closeDropdown}
                className="animate-in fade-in zoom-in-95 absolute right-0 mt-4 w-[280px] rounded-3xl border border-gray-100 bg-white p-3 shadow-2xl shadow-gray-200/50 duration-200 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
            >
                <div className="mb-2 rounded-2xl border-b border-gray-50 bg-gray-50/50 px-3 py-4 dark:border-gray-800 dark:bg-gray-800/50">
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                        {user
                            ? `${user.first_name} ${user.last_name}`
                            : "Saurav Karn"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                        {user?.email || "saurav@example.com"}
                    </p>
                </div>

                <div className="space-y-1">
                    <DropdownItem
                        onItemClick={closeDropdown}
                        tag="a"
                        href="/profile"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-600 transition-all hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                    >
                        <UserCircle className="h-5 w-5" />
                        Edit Profile
                    </DropdownItem>

                    <DropdownItem
                        onItemClick={closeDropdown}
                        tag="a"
                        href="/settings"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-600 transition-all hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                    >
                        <Settings className="h-5 w-5" />
                        Account Settings
                    </DropdownItem>

                    <DropdownItem
                        onItemClick={closeDropdown}
                        tag="a"
                        href="/support"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-600 transition-all hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                    >
                        <LifeBuoy className="h-5 w-5" />
                        Support Hub
                    </DropdownItem>
                </div>

                <div className="mt-2 border-t border-gray-50 pt-2 dark:border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </Dropdown>
        </div>
    );
}
