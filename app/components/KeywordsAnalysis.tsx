'use client';

import { useState } from 'react';
import { analyzeComments } from '../services/openRouterService';
import type { Comment } from '../types/comment';
import { useMount } from 'react-use';


interface Keyword {
    keyword: string;
    relevance: number;
}

interface KeywordsAnalysisProps {
    comments: Comment[];
    isVisible: boolean;
}

export default function KeywordsAnalysis({ comments, isVisible }: KeywordsAnalysisProps) {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useMount(async () => {
        if (!isVisible || !comments.length) return;

        setIsLoading(true);
        setError(null);
        try {
            const commentTexts = comments.map(comment => comment.text);
            const result = await analyzeComments(commentTexts);
            setKeywords(result.keywords.map(({ word, relevance }) => ({
                keyword: word,
                relevance
            })));
        } catch (err) {
            setError('Failed to analyze comments');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    });

    if (!isVisible) return null;

    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Key Topics & Themes
            </h3>

            {isLoading ? (
                <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing comments...</span>
                </div>
            ) : error ? (
                <div className="text-red-500 dark:text-red-400 p-4 text-center">
                    {error}
                </div>
            ) : keywords.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {keywords.map((keyword, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
                            style={{
                                borderLeft: `4px solid hsl(${keyword.relevance * 2}, 70%, 50%)`
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-gray-900 dark:text-white font-medium">
                                    {keyword.keyword}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {keyword.relevance}%
                                </span>
                            </div>
                            <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${keyword.relevance}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-gray-500 dark:text-gray-400 p-4 text-center">
                    No keywords found
                </div>
            )}
        </div>
    );
} 