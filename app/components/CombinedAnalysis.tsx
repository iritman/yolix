import React from "react";
import { Keyword, Topic } from "../services/combinedAnalysisService";

interface CombinedAnalysisProps {
    keywords: Keyword[];
    topics: Topic[];
    isLoading?: boolean;
    error?: string;
}

export default function CombinedAnalysis({
    keywords,
    topics,
    isLoading = false,
    error,
}: CombinedAnalysisProps) {
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-3">Analyzing Keywords...</h3>
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-3">Analyzing Topics...</h3>
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Keywords Section */}
            <div>
                <h3 className="text-lg font-semibold mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword) => (
                        <span
                            key={keyword.word}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            style={{
                                opacity: keyword.relevance / 100,
                                fontWeight: keyword.relevance > 70 ? "bold" : "normal",
                            }}
                        >
                            {keyword.word} ({keyword.relevance})
                        </span>
                    ))}
                </div>
            </div>

            {/* Topics Section */}
            <div>
                <h3 className="text-lg font-semibold mb-3">Main Topics</h3>
                <div className="space-y-4">
                    {topics.map((topic) => (
                        <div
                            key={topic.topic}
                            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{topic.topic}</h4>
                                <span className="text-sm text-gray-500">
                                    {topic.commentCount} comments
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {topic.keywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${topic.relevance}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-500">
                                    Relevance: {topic.relevance}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 