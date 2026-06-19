import type React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DropdownItemProps {
    tag?: "a" | "button";
    href?: string;
    onClick?: () => void;
    onItemClick?: () => void;
    baseClassName?: string;
    className?: string;
    children: React.ReactNode;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
    tag = "button",
    href,
    onClick,
    onItemClick,
    baseClassName = "block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-surface-secondary cursor-pointer transition-colors duration-200",
    className = "",
    children,
}) => {
    const combinedClasses = cn(baseClassName, className);

    const handleClick = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent card from potentially intercepting clicks
        if (tag === "button") {
            event.preventDefault();
        }
        if (onClick) onClick();
        if (onItemClick) onItemClick();
    };

    if (tag === "a" && href) {
        return (
            <Link href={href} className={combinedClasses} onClick={handleClick}>
                {children}
            </Link>
        );
    }

    return (
        <button onClick={handleClick} className={combinedClasses}>
            {children}
        </button>
    );
};
