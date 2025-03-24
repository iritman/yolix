'use client';

import { Comment } from '../types/comment';

interface CSVDownloadProps {
    comments: Comment[];
}

class CSVDownload {
    private comments: Comment[];

    constructor(props: CSVDownloadProps) {
        this.comments = props.comments;
    }

    private convertToCSV(): string {
        const headers = ['Comment', 'Author', 'Date', 'Registration Date', 'Registration Time', 'Likes', 'Replies'];
        const rows = this.comments.map(comment => [
            `"${comment.text.replace(/"/g, '""')}"`,
            `"${comment.author.replace(/"/g, '""')}"`,
            `"${comment.date}"`,
            `"${comment.regDate}"`,
            `"${comment.regTime}"`,
            comment.likes || '0',
            comment.replies || '0'
        ]);

        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    }

    public downloadCSV(): void {
        const csv = this.convertToCSV();
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `youtube-comments-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export default CSVDownload; 