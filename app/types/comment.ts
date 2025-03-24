export interface Comment {
  author: string;
  text: string;
  date: string;
  likes: number;
  replies: number;
  regDate: string;
  regTime: string;
}

export interface TopUser {
  author: string;
  count: number;
}

export interface MonthlyComment {
  month: string;
  count: number;
}

export interface CSVError {
  message: string;
  details?: string;
}

export const REQUIRED_CSV_HEADERS = [
  "author",
  "text",
  "date",
  "likes",
  "replies",
] as const;
