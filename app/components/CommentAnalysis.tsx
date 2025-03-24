'use client';

import { useState, useMemo } from 'react';
import { useMount } from 'react-use';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Comment } from '../types/comment';
import CommentSummary from './CommentSummary';
import CombinedAnalysis from './CombinedAnalysis';
import { analyzeComments } from '../services/combinedAnalysisService';

interface CommentAnalysisProps {
    comments: Comment[];
}

export default function CommentAnalysis({ comments }: CommentAnalysisProps) {
    const [analysisData, setAnalysisData] = useState<{ keywords: any[]; topics: any[] } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const topUsers = useMemo(() => {
        const userCounts = comments.reduce((acc: { [key: string]: number }, comment) => {
            acc[comment.author] = (acc[comment.author] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(userCounts)
            .map(([author, count]) => ({ author, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [comments]);

    const monthlyComments = useMemo(() => {
        const monthlyCounts = comments.reduce((acc: { [key: string]: number }, comment) => {
            const date = new Date(comment.date);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            acc[monthYear] = (acc[monthYear] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(monthlyCounts)
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }, [comments]);

    useMount(async () => {
        // if (!showAnalysis) return;

        setIsAnalyzing(true);
        setAnalysisError(null);
        try {
            const commentTexts = comments.map(comment => comment.text);
            const analysis = await analyzeComments(commentTexts);
            setAnalysisData(analysis);
        } catch (error) {
            setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze comments');
        } finally {
            setIsAnalyzing(false);
        }
    });

    // if (!showAnalysis) return null;

    return (
        <div className="space-y-8 w-full">
            <CommentSummary comments={comments} />

            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top Commenters</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={topUsers}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="author" type="category" width={90} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3B82F6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Comments Timeline</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={monthlyComments}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        angle={-45}
                                        textAnchor="end"
                                        height={70}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3B82F6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {analysisData && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                    <CombinedAnalysis
                        keywords={analysisData.keywords}
                        topics={analysisData.topics}
                        isLoading={isAnalyzing}
                        error={analysisError || undefined}
                    />
                </div>
            )}
        </div>
    );
} 