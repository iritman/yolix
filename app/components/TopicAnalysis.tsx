import { useMemo, useState } from "react";
import { useMount } from "react-use";
import { analyzeTopics, Topic } from "../services/topicAnalysisService";
import { Comment } from "../types/comment";

interface TopicAnalysisProps {
    comments: Comment[];
    isVisible: boolean;
}

export default function TopicAnalysis({ comments, isVisible }: TopicAnalysisProps) {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useMount(async () => {
        if (!isVisible || comments.length === 0) return;

        setIsLoading(true);
        setError(null);

        try {
            const commentTexts = comments.map((comment) => comment.text);
            const response = await analyzeTopics(commentTexts);
            setTopics(response.topics || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to analyze topics");
        } finally {
            setIsLoading(false);
        }
    });

    const filteredAndSortedTopics = useMemo(() => {
        if (!Array.isArray(topics)) return [];
        return topics
            .filter(topic => topic.relevance > 50)
            .sort((a, b) => b.relevance - a.relevance);
    }, [topics]);

    if (!isVisible || comments.length === 0) return null;

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Analyzing Topics...</h3>
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Topic Analysis</h3>
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (filteredAndSortedTopics.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Topic Analysis</h3>
                <p className="text-gray-500">No significant topics found in the comments.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Main Topics</h3>
            <div className="space-y-4">
                {filteredAndSortedTopics.map((topic, index) => (
                    <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-medium">{topic.topic}</h4>
                            <span className="text-sm text-gray-500">
                                {topic.commentCount} comments
                            </span>
                        </div>
                        <div className="mb-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${topic.relevance}%` }}
                                ></div>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                Relevance: {topic.relevance}%
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {topic.keywords.map((keyword, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 