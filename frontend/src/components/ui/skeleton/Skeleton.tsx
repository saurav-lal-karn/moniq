import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const skeletonVariants = cva("animate-pulse bg-surface-secondary", {
    variants: {
        variant: {
            rectangle: "rounded-md",
            circle: "rounded-full",
            text: "rounded h-4 w-full",
        },
        size: {
            xs: "",
            sm: "",
            md: "",
            lg: "",
            xl: "",
            full: "w-full",
        },
    },
    compoundVariants: [
        // Circle sizes
        { variant: "circle", size: "xs", class: "size-6" },
        { variant: "circle", size: "sm", class: "size-8" },
        { variant: "circle", size: "md", class: "size-10" },
        { variant: "circle", size: "lg", class: "size-12" },
        { variant: "circle", size: "xl", class: "size-16" },
        // Text line heights
        { variant: "text", size: "xs", class: "h-3" },
        { variant: "text", size: "sm", class: "h-4" },
        { variant: "text", size: "md", class: "h-5" },
        { variant: "text", size: "lg", class: "h-6" },
        { variant: "text", size: "xl", class: "h-8" },
    ],
    defaultVariants: {
        variant: "rectangle",
        size: "md",
    },
});

export interface SkeletonProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
    /** Width of the skeleton (for rectangle variant) */
    width?: string | number;
    /** Height of the skeleton (for rectangle variant) */
    height?: string | number;
}

function Skeleton({
    className,
    variant = "rectangle",
    size = "md",
    width,
    height,
    style,
    ...props
}: SkeletonProps) {
    const inlineStyle = {
        ...style,
        ...(width !== undefined && {
            width: typeof width === "number" ? `${width}px` : width,
        }),
        ...(height !== undefined && {
            height: typeof height === "number" ? `${height}px` : height,
        }),
    };

    return (
        <div
            data-slot="skeleton"
            data-variant={variant}
            className={cn(skeletonVariants({ variant, size, className }))}
            style={Object.keys(inlineStyle).length > 0 ? inlineStyle : undefined}
            {...props}
        />
    );
}

interface SkeletonTextProps extends Omit<SkeletonProps, "variant"> {
    /** Number of text lines to render */
    lines?: number;
    /** Gap between lines */
    gap?: "sm" | "md" | "lg";
}

const gapClasses = {
    sm: "gap-1.5",
    md: "gap-2",
    lg: "gap-3",
};

function SkeletonText({
    lines = 3,
    gap = "md",
    className,
    size,
    ...props
}: SkeletonTextProps) {
    return (
        <div className={cn("flex flex-col", gapClasses[gap], className)}>
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    variant="text"
                    size={size}
                    // Make the last line shorter for a more natural look
                    className={index === lines - 1 ? "w-3/4" : undefined}
                    {...props}
                />
            ))}
        </div>
    );
}

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Show avatar placeholder */
    showAvatar?: boolean;
    /** Number of text lines */
    lines?: number;
}

function SkeletonCard({
    showAvatar = true,
    lines = 2,
    className,
    ...props
}: SkeletonCardProps) {
    return (
        <div
            className={cn(
                "flex items-start gap-3 rounded-lg border border-border bg-surface p-4",
                className
            )}
            {...props}
        >
            {showAvatar && <Skeleton variant="circle" size="md" />}
            <div className="flex-1 space-y-2">
                <Skeleton variant="text" size="md" className="w-1/2" />
                <SkeletonText lines={lines} size="sm" />
            </div>
        </div>
    );
}

interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Number of rows */
    rows?: number;
    /** Number of columns */
    columns?: number;
}

function SkeletonTable({
    rows = 5,
    columns = 4,
    className,
    ...props
}: SkeletonTableProps) {
    return (
        <div className={cn("w-full space-y-3", className)} {...props}>
            {/* Header */}
            <div className="flex gap-4 border-b border-border pb-3">
                {Array.from({ length: columns }).map((_, index) => (
                    <Skeleton
                        key={index}
                        variant="text"
                        size="md"
                        className="flex-1"
                    />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 py-2">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton
                            key={colIndex}
                            variant="text"
                            size="sm"
                            className="flex-1"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, skeletonVariants };
