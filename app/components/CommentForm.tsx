'use client';

import { Suspense, useState, useEffect } from 'react';
import { useComments } from '../hooks/useComments';
import type { Comment } from '../types/comment';
import { ErrorBoundary } from './ErrorBoundary';
import CSVDownload from './CSVDownload';

interface CommentFormProps {
    onCommentsFetched: (comments: Comment[], totalComments: number) => void;
    onError: (error: string) => void;
}

interface VideoDetails {
    title: string;
    thumbnail: string;
}

function VideoPreview({ title, thumbnail, isLoading, fetchedComments, onDownload }: {
    title: string;
    thumbnail: string;
    isLoading?: boolean;
    totalComments?: number;
    fetchedComments?: number;
    onDownload?: () => void;
}) {
    return (
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
            <div className="w-full sm:w-60 flex-shrink-0">
                <img
                    src={thumbnail}
                    alt={title}
                    className="w-full h-auto object-cover rounded"
                    style={{ aspectRatio: '16/9' }}
                />
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">{title}</h3>
                {fetchedComments !== undefined && (
                    <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {fetchedComments.toLocaleString()} comments
                        </p>
                        {onDownload && (
                            <button
                                onClick={onDownload}
                                className="p-1.5 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200 cursor-pointer"
                                title="Download CSV"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
                {isLoading && (
                    <div className="animate-pulse mt-2">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-32 mt-2"></div>
                    </div>
                )}
            </div>
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center mt-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-blue-600 font-medium">Processing comments...</span>
        </div>
    );
}

function CommentFormContent({ url, onCommentsFetched, onComplete, onVideoDetails }: {
    url: string;
    onCommentsFetched: (comments: Comment[], totalComments: number) => void;
    onComplete: () => void;
    onVideoDetails: (details: VideoDetails) => void;
}) {
    const data = useComments(url);

    useEffect(() => {
        if (data) {
            onVideoDetails(data.videoDetails);
            const commentsWithDates = data.comments.map(comment => ({
                ...comment,
                regDate: comment.date,
                regTime: new Date(comment.date).toLocaleTimeString()
            }));
            onCommentsFetched(commentsWithDates, data.totalComments);
            onComplete();
        }
    }, [data, onCommentsFetched, onComplete, onVideoDetails]);

    if (!data) return null;

    return (
        <div className="space-y-4">
            <VideoPreview
                title={data.videoDetails.title}
                thumbnail={data.videoDetails.thumbnail}
                isLoading={true}
                totalComments={data.totalComments}
                fetchedComments={data.comments.length}
            />
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Fetched {data.comments.length.toLocaleString()} of {data.totalComments.toLocaleString()} comments
            </div>
        </div>
    );
}

export default function CommentForm({ onCommentsFetched, onError }: CommentFormProps) {
    const [url, setUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
    const [totalComments, setTotalComments] = useState<number>(0);
    const [fetchedComments, setFetchedComments] = useState<number>(0);
    const [comments, setComments] = useState<Comment[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url || isSubmitting) return;
        setIsSubmitting(true);
        onError('');
    };

    const handleComplete = () => {
        setIsSubmitting(false);
    };

    const handleCommentsFetched = (newComments: Comment[], total: number) => {
        setTotalComments(total);
        setFetchedComments(newComments.length);
        setComments(newComments);
        onCommentsFetched(newComments, total);
    };

    const handleDownload = () => {
        const csvDownload = new CSVDownload({ comments });
        csvDownload.downloadCSV();
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       dark:bg-gray-800 dark:text-white"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-200 min-w-[160px] cursor-pointer"
                    >
                        Download Comments
                    </button>
                </div>
                {videoDetails && !isSubmitting && (
                    <VideoPreview
                        title={videoDetails.title}
                        thumbnail={videoDetails.thumbnail}
                        totalComments={totalComments}
                        fetchedComments={fetchedComments}
                        onDownload={handleDownload}
                    />
                )}
                {isSubmitting && (
                    <Suspense fallback={<LoadingSpinner />}>
                        <ErrorBoundary onError={(error) => {
                            onError(error);
                            setIsSubmitting(false);
                        }}>
                            <CommentFormContent
                                url={url}
                                onCommentsFetched={handleCommentsFetched}
                                onComplete={handleComplete}
                                onVideoDetails={setVideoDetails}
                            />
                        </ErrorBoundary>
                    </Suspense>
                )}
            </form>
        </div>
    );
} 