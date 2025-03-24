'use client';

import { useState } from 'react';
import CommentAnalysis from './components/CommentAnalysis';
import CommentForm from './components/CommentForm';
import Features from './components/Features';
import type { Comment } from './types/comment';
import Footer from './components/Footer';

export default function Home() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCommentsFetched = (newComments: Comment[]) => {
    setComments(newComments);
    setShowAnalysis(false); // Reset analysis when new comments are loaded
  };

  const handleAnalyzeComments = async () => {
    setIsAnalyzing(true);

    try {
      setShowAnalysis(true);
    } catch (e) {
      setError('An error occurred while analyzing comments.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Yolix 🎥
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Professional YouTube Comments Analysis Platform
            </p>
          </div>

          <CommentForm onCommentsFetched={handleCommentsFetched} onError={setError} />

          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
              {error}
            </div>
          )}

          {comments.length > 0 && (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="w-full flex justify-center">
                <button
                  onClick={handleAnalyzeComments}
                  disabled={isAnalyzing}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium
                           hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors duration-200 shadow-lg hover:shadow-xl
                           w-full sm:w-auto"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    'Analyze Comments'
                  )}
                </button>
              </div>
              {showAnalysis && <CommentAnalysis comments={comments} />}
            </div>
          )}

          <Features />

          <Footer />
        </div>
      </div>
    </div>
  );
}
