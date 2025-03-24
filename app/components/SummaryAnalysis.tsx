import { Summary } from '../services/summaryService';
import { useState } from 'react';

interface SummaryAnalysisProps {
    summary: Summary;
}

export default function SummaryAnalysis({ summary }: SummaryAnalysisProps) {
    const [showEnglish, setShowEnglish] = useState(true);

    const toggleButtonText = showEnglish
        ? `Show summary in ${summary.detectedLanguage}`
        : 'Show summary in English';

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Summary</h3>
                <button
                    onClick={() => setShowEnglish(!showEnglish)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    {toggleButtonText}
                </button>
            </div>
            <p className="text-gray-700 text-justify">
                {showEnglish ? summary.english : summary.translated}
            </p>
        </>
    );
}