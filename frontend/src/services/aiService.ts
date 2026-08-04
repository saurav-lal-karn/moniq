export interface AnalysisFieldConfidence {
    value: string | number | null;
    confidence: number;
}

export interface ExtractedAnalysis {
    amount?: number;
    category?: string;
    date?: string;
    description?: string;
    merchant?: string;
    transaction_type?: "INCOME" | "EXPENSE" | "TRANSFER";
    confidence?: number;
    confidence_scores?: Record<string, number>;
}

export interface AnalysisResponse {
    analysis: ExtractedAnalysis;
    raw_text?: string;
    file_id?: string;
}

export const aiService = {
    async analyzeFile(file: File, familyId: string): Promise<AnalysisResponse> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("family_id", familyId);

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3080";
        const res = await fetch(`${API_URL}/ai/analyze`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            throw new Error("Failed to analyze file");
        }

        const json = await res.json();
        return json.data || json;
    },
};
