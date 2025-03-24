import { NextResponse } from "next/server";
import axios from "axios";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const MAX_RESULTS_PER_PAGE = 100;

interface YouTubeComment {
  snippet: {
    topLevelComment: {
      snippet: {
        authorDisplayName: string;
        textDisplay: string;
        publishedAt: string;
        likeCount: number;
      };
    };
    totalReplyCount: number;
  };
}

interface YouTubeVideoDetails {
  items: [
    {
      snippet: {
        title: string;
        thumbnails: {
          medium: {
            url: string;
          };
        };
      };
    }
  ];
}

interface YouTubeCommentResponse {
  items: YouTubeComment[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
  };
}

async function fetchAllComments(
  videoId: string,
  apiKey: string
): Promise<{ comments: any[]; totalResults: number }> {
  let allComments: any[] = [];
  let nextPageToken: string | undefined;
  let pageCount = 0;
  let totalResults = 0;

  do {
    const response = await axios.get<YouTubeCommentResponse>(
      `${YOUTUBE_API_BASE_URL}/commentThreads`,
      {
        params: {
          part: "snippet",
          videoId: videoId,
          maxResults: MAX_RESULTS_PER_PAGE,
          pageToken: nextPageToken,
          key: apiKey,
        },
      }
    );

    const comments = response.data.items.map((item) => ({
      author: item.snippet.topLevelComment.snippet.authorDisplayName,
      text: item.snippet.topLevelComment.snippet.textDisplay,
      date: item.snippet.topLevelComment.snippet.publishedAt,
      likes: item.snippet.topLevelComment.snippet.likeCount,
      replies: item.snippet.totalReplyCount,
    }));

    allComments = [...allComments, ...comments];
    nextPageToken = response.data.nextPageToken;
    totalResults = response.data.pageInfo.totalResults;
    pageCount++;

    // Add a small delay to avoid hitting rate limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  } while (nextPageToken);

  return { comments: allComments, totalResults };
}

export async function POST(request: Request) {
  try {
    if (!YOUTUBE_API_KEY) {
      console.error("YouTube API key is missing");
      throw new Error("YouTube API key is not configured");
    }

    const body = await request.json();

    const { url } = body;
    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    // Extract video ID from URL
    const videoId = url.match(/[?&]v=([^&]+)/)?.[1];

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    try {
      // First, get video details
      const videoDetailsResponse = await axios.get<YouTubeVideoDetails>(
        `${YOUTUBE_API_BASE_URL}/videos`,
        {
          params: {
            part: "snippet",
            id: videoId,
            key: YOUTUBE_API_KEY,
          },
        }
      );

      if (!videoDetailsResponse.data.items?.length) {
        console.error("No video details found");
        return NextResponse.json(
          { success: false, error: "Video not found or is private" },
          { status: 404 }
        );
      }

      const videoDetails = {
        title: videoDetailsResponse.data.items[0].snippet.title,
        thumbnail:
          videoDetailsResponse.data.items[0].snippet.thumbnails.medium.url,
      };

      // Then get all comments
      const { comments, totalResults } = await fetchAllComments(
        videoId,
        YOUTUBE_API_KEY
      );

      return NextResponse.json({
        success: true,
        totalComments: totalResults,
        comments,
        videoDetails,
      });
    } catch (apiError: any) {
      console.error("YouTube API Error:", {
        message: apiError.message,
        response: apiError.response?.data,
        status: apiError.response?.status,
      });

      const errorMessage =
        apiError.response?.data?.error?.message || "Failed to fetch video data";
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error: any) {
    console.error("Server Error:", {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
