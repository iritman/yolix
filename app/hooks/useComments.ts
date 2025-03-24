"use client";

import { use } from "react";
import axios from "axios";
import type { Comment } from "../types/comment";

interface VideoDetails {
  title: string;
  thumbnail: string;
}

interface ApiResponse {
  success: boolean;
  totalComments: number;
  comments: Comment[];
  videoDetails: VideoDetails;
  error?: string;
}

// Cache to store promises for each URL
const promiseCache = new Map<string, Promise<ApiResponse>>();

async function fetchComments(url: string) {
  try {
    const { data } = await axios.post<ApiResponse>("/api/comments", { url });
    if (!data.success) {
      throw new Error(data.error || "Failed to fetch comments");
    }
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || error.message;
      console.error("API Error:", {
        status: error.response?.status,
        message: errorMessage,
        data: error.response?.data,
      });
      throw new Error(errorMessage);
    }
    throw error;
  }
}

export function useComments(url: string) {
  let promise = promiseCache.get(url);
  if (!promise) {
    promise = fetchComments(url);
    promiseCache.set(url, promise);
  }
  return use(promise);
}
