"use client";
import React from "react";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

interface FieldConfidenceIndicatorProps {
    confidence?: number; // 0-1 scale
    fieldName: string;
    showLabel?: boolean;
}

export const FieldConfidenceIndicator: React.FC<
    FieldConfidenceIndicatorProps
> = ({ confidence, fieldName, showLabel = true }) => {
    if (confidence === undefined || confidence === null) {
        return null; // Don't show indicator if no confidence data
    }

    const getConfidenceLevel = (
        score: number
    ): {
        label: string;
        color: string;
        icon: React.ReactNode;
        bgColor: string;
    } => {
        if (score >= 0.8) {
            return {
                label: "High Confidence",
                color: "text-emerald-600 dark:text-emerald-400",
                bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
                icon: <CheckCircle2 className="h-3 w-3" />,
            };
        } else if (score >= 0.5) {
            return {
                label: "Medium Confidence",
                color: "text-amber-600 dark:text-amber-400",
                bgColor: "bg-amber-50 dark:bg-amber-950/30",
                icon: <AlertTriangle className="h-3 w-3" />,
            };
        } else {
            return {
                label: "Low Confidence - Please Verify",
                color: "text-rose-600 dark:text-rose-400",
                bgColor: "bg-rose-50 dark:bg-rose-950/30",
                icon: <AlertCircle className="h-3 w-3" />,
            };
        }
    };

    const confidenceInfo = getConfidenceLevel(confidence);
    const percentage = Math.round(confidence * 100);

    return (
        <div className="mt-1 flex items-center gap-2">
            <div
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${confidenceInfo.bgColor} ${confidenceInfo.color}`}
                title={`AI is ${percentage}% confident in ${fieldName}`}
            >
                {confidenceInfo.icon}
                {showLabel && (
                    <span className="text-[9px] font-bold tracking-wider uppercase">
                        {percentage}%
                    </span>
                )}
            </div>
            {confidence < 0.5 && (
                <span className="text-[9px] text-gray-500 italic dark:text-gray-400">
                    Please verify this field
                </span>
            )}
        </div>
    );
};
