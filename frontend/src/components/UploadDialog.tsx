"use client";
import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import {
    Upload,
    X,
    Check,
    Sparkles,
    FileText,
    AlertCircle,
} from "lucide-react";
import { aiService, AnalysisResponse } from "@/services/aiService";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface UploadDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAnalysisComplete?: (data: AnalysisResponse) => void;
}

const CATEGORIES = [
    "Groceries",
    "Dining Out",
    "Transportation",
    "Utilities",
    "Entertainment",
    "Healthcare",
    "Shopping",
    "Travel",
    "Insurance",
    "Investments",
];

export const UploadDialog: React.FC<UploadDialogProps> = ({
    isOpen,
    onClose,
    onAnalysisComplete,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState("");
    const [isAiMode, setIsAiMode] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [analysisResult, setAnalysisResult] =
        useState<AnalysisResponse | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmedType, setConfirmedType] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setAnalysisResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file first");
            return;
        }

        if (!isAiMode && !category) {
            toast.error("Please select a category");
            return;
        }

        setIsUploading(true);
        try {
            if (!user?.family?.id) {
                toast.error("Family context missing");
                return;
            }
            const result = await aiService.analyzeFile(file, user.family.id);
            setAnalysisResult(result);
            if (isAiMode && result?.analysis?.category) {
                setCategory(result.analysis.category);
            }
            // Show confirmation step
            setConfirmedType(result.analysis.transaction_type || "EXPENSE");
            setShowConfirmation(true);
            toast.success("File processed successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to analyze file");
        } finally {
            setIsUploading(false);
        }
    };

    const handleConfirmType = () => {
        if (onAnalysisComplete && analysisResult) {
            // Pass the confirmed type along with the analysis result
            onAnalysisComplete({
                ...analysisResult,
                analysis: {
                    ...analysisResult.analysis,
                    transaction_type: confirmedType,
                },
            });
        }
        handleClose();
    };

    const reset = () => {
        setFile(null);
        setCategory("");
        setAnalysisResult(null);
        setIsUploading(false);
        setShowConfirmation(false);
        setConfirmedType("");
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg">
            <div className="p-8">
                <div className="mb-8 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner dark:bg-emerald-900/30">
                        <Upload className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">
                            Upload Document
                        </h3>
                        <p className="text-sm font-bold tracking-widest text-gray-400 uppercase">
                            Receipts, Bills & More
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* File Dropzone Mockup */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-8 transition-all ${
                            file
                                ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-900/10"
                                : "border-gray-200 hover:border-blue-500/50 hover:bg-blue-50/30 dark:border-gray-800 dark:hover:bg-blue-900/10"
                        }`}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,application/pdf"
                        />
                        {file ? (
                            <>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div className="text-center">
                                    <p className="max-w-[200px] truncate text-sm font-black text-gray-900 dark:text-white">
                                        {file.name}
                                    </p>
                                    <p className="mt-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        reset();
                                    }}
                                    className="absolute top-4 right-4 rounded-lg bg-white p-1.5 text-gray-400 shadow-sm transition-colors hover:text-red-500 dark:bg-gray-800"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400 transition-all group-hover:bg-blue-100 group-hover:text-blue-500 dark:bg-gray-800 dark:group-hover:bg-blue-900/30">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-black text-gray-900 dark:text-white">
                                        Click to select
                                    </p>
                                    <p className="mt-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                        Images or PDFs up to 5MB
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex rounded-2xl bg-gray-100 p-1 dark:bg-gray-800">
                        <button
                            onClick={() => setIsAiMode(true)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black tracking-widest uppercase transition-all ${isAiMode ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            AI Detect
                        </button>
                        <button
                            onClick={() => setIsAiMode(false)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black tracking-widest uppercase transition-all ${!isAiMode ? "bg-white text-emerald-600 shadow-sm dark:bg-gray-700" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                        >
                            <span className="flex h-3.5 w-3.5 items-center justify-center">
                                M
                            </span>
                            Manual
                        </button>
                    </div>

                    {/* Category Selection */}
                    {!isAiMode && (
                        <div className="space-y-2">
                            <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                Select Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="h-12 w-full rounded-2xl border-none bg-gray-50 px-4 text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-gray-800"
                            >
                                <option value="">Select a category...</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Analysis Progress / Result */}
                    {isUploading && (
                        <div className="flex animate-pulse items-center gap-4 rounded-2xl bg-blue-50/50 p-4 dark:bg-blue-900/10">
                            <Sparkles className="h-5 w-5 animate-spin text-blue-500" />
                            <div className="flex-1">
                                <p className="text-sm font-black text-blue-900 italic dark:text-blue-100">
                                    Analyzing document with AI...
                                </p>
                                <div className="mt-2 h-1 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-800">
                                    <div className="animate-infinite-scroll h-full w-1/2 bg-blue-500"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {analysisResult?.analysis && (
                        <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-emerald-500" />
                                    <span className="text-xs font-black tracking-widest text-emerald-900 uppercase dark:text-emerald-100">
                                        AI Analysis Complete
                                    </span>
                                </div>
                                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white uppercase">
                                    {Math.round(
                                        (analysisResult.analysis.confidence ||
                                            0) * 100
                                    )}
                                    % Confidence
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800">
                                <span className="text-sm font-medium text-gray-500">
                                    Detected Category
                                </span>
                                <span className="text-sm font-black text-emerald-600">
                                    {analysisResult.analysis.category ||
                                        "Unknown"}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Category Confirmation Step */}
                    {showConfirmation && analysisResult && (
                        <div className="animate-in fade-in slide-in-from-top-4 space-y-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50 p-5 duration-300 dark:border-blue-800/30 dark:from-blue-900/20 dark:to-purple-900/20">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-blue-500" />
                                <span className="text-sm font-black tracking-widest text-blue-900 uppercase dark:text-blue-100">
                                    Confirm Transaction Type
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                AI detected this as an{" "}
                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                    {analysisResult.analysis.transaction_type}
                                </span>{" "}
                                transaction. Is this correct?
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setConfirmedType("EXPENSE")}
                                    className={`rounded-xl border-2 p-4 text-center transition-all ${
                                        confirmedType === "EXPENSE"
                                            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                            : "border-gray-200 hover:border-red-300 dark:border-gray-700"
                                    }`}
                                >
                                    <div className="mb-1 text-2xl">💸</div>
                                    <div className="text-xs font-black tracking-widest text-gray-700 uppercase dark:text-gray-300">
                                        Expense
                                    </div>
                                    <div className="mt-1 text-[10px] text-gray-500">
                                        Money Out
                                    </div>
                                </button>
                                <button
                                    onClick={() => setConfirmedType("INCOME")}
                                    className={`rounded-xl border-2 p-4 text-center transition-all ${
                                        confirmedType === "INCOME"
                                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                            : "border-gray-200 hover:border-green-300 dark:border-gray-700"
                                    }`}
                                >
                                    <div className="mb-1 text-2xl">💰</div>
                                    <div className="text-xs font-black tracking-widest text-gray-700 uppercase dark:text-gray-300">
                                        Income
                                    </div>
                                    <div className="mt-1 text-[10px] text-gray-500">
                                        Money In
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-10 flex gap-3">
                    <button
                        onClick={handleClose}
                        className="h-14 flex-1 rounded-2xl border-2 border-gray-50 text-xs font-black tracking-widest text-gray-400 uppercase transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-800 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={
                            !file ||
                            isUploading ||
                            (!isAiMode && !category) ||
                            (showConfirmation && !confirmedType)
                        }
                        onClick={
                            showConfirmation ? handleConfirmType : handleUpload
                        }
                        className={`flex h-14 flex-2 items-center justify-center gap-2 rounded-2xl text-xs font-black tracking-widest uppercase shadow-xl transition-all active:scale-95 ${
                            !file ||
                            isUploading ||
                            (!isAiMode && !category) ||
                            (showConfirmation && !confirmedType)
                                ? "cursor-not-allowed bg-gray-100 text-gray-400 shadow-none dark:bg-gray-800"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20"
                        }`}
                    >
                        {isUploading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        ) : showConfirmation ? (
                            <>
                                <Check className="h-4 w-4" />
                                Confirm & Continue
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                {isAiMode
                                    ? "Analyze & Upload"
                                    : "Upload Document"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
