import { useState, useRef } from "react";
import { useMount } from "react-use";
import { generateSummary, Summary } from "../services/summaryService";
import { Comment } from "../types/comment";
import SummaryAnalysis from "./SummaryAnalysis";

interface CommentSummaryProps {
    comments: Comment[];
}

export default function CommentSummary({ comments }: CommentSummaryProps) {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasAnalyzed = useRef(false);

    useMount(async () => {

        setIsLoading(true);
        setError(null);

        try {
            const commentTexts = comments.map((comment) => comment.text);
            const summaryData = await generateSummary(commentTexts);
            setSummary(summaryData);
            hasAnalyzed.current = true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate summary");
        } finally {
            setIsLoading(false);
        }
    });


    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Generating Summary...</h3>
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Comment Summary</h3>
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!summary) return null;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <SummaryAnalysis summary={summary} />
        </div>
    );
} 