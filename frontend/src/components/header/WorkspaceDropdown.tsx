"use client";

import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useWorkspace } from "@/context/WorkspaceContext";
import { ChevronDown, Briefcase } from "lucide-react";

export default function WorkspaceDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const { workspaces, activeWorkspace, setActiveWorkspace, loading } = useWorkspace();

    function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    }

    function closeDropdown() {
        setIsOpen(false);
    }

    if (loading) {
        return <div className="h-10 w-32 animate-pulse rounded-lg bg-surface-secondary"></div>;
    }

    if (!workspaces || workspaces.length === 0) {
        return null;
    }

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="group flex items-center gap-2 rounded-xl p-2 transition-colors hover:bg-surface-secondary"
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600">
                    <Briefcase className="h-4 w-4" />
                </div>
                
                <div className="hidden text-left md:block">
                    <p className="text-sm font-semibold text-foreground">
                        {activeWorkspace?.name || "Select Workspace"}
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
                className="animate-in fade-in zoom-in-95 absolute right-0 mt-2 w-[240px] rounded-2xl border border-border bg-surface p-2 shadow-2xl shadow-black/10 duration-200"
            >
                <div className="mb-2 px-3 py-2">
                    <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                        Workspaces
                    </p>
                </div>

                <div className="max-h-64 space-y-1 overflow-y-auto">
                    {workspaces.map((workspace) => (
                        <DropdownItem
                            key={workspace.id}
                            onItemClick={() => {
                                setActiveWorkspace(workspace);
                                closeDropdown();
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                                activeWorkspace?.id === workspace.id
                                    ? "bg-brand-50 text-brand-600 font-bold dark:bg-brand-500/10 dark:text-brand-400"
                                    : "text-foreground-muted hover:bg-surface-secondary hover:text-foreground font-medium"
                            }`}
                        >
                            <div className="flex flex-col items-start">
                                <span>{workspace.name}</span>
                                {workspace.type && (
                                    <span className="text-[10px] capitalize opacity-70">
                                        {workspace.type}
                                    </span>
                                )}
                            </div>
                        </DropdownItem>
                    ))}
                </div>
            </Dropdown>
        </div>
    );
}
