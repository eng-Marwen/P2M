import axios from "axios";
import { ENV } from "../../config/env";

export interface RagHit {
  score: number;
  listing_url?: string | null;
  name?: string | null;
  address?: string | null;
  type?: string | null;
  regularPrice?: number | null;
  discountedPrice?: number | null;
  description?: string | null;
}

export interface RagResponse {
  session_id: string;
  query: string;
  answer: string;
  total_hits: number;
  hits: RagHit[];
}

const normalizeAiBaseUrl = (rawUrl?: string): string => {
  const fallback = "http://localhost:8000";
  const value = (rawUrl || fallback).trim();

  if (!value) {
    return fallback;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value.replace(/\/$/, "");
  }

  return `http://${value.replace(/\/$/, "")}`;
};

export const queryRag = async (
  query: string,
  topK = 3,
  sessionId?: string,
): Promise<RagResponse> => {
  const baseUrl = normalizeAiBaseUrl(ENV.AI_API_URL);
  const endpoint = `${baseUrl}/api/rag/query`;

  const response = await axios.post<RagResponse>(endpoint, {
    query,
    top_k: topK,
    session_id: sessionId,
  });

  return response.data;
};

export const clearRagHistory = async (sessionId?: string): Promise<void> => {
  const baseUrl = normalizeAiBaseUrl(ENV.AI_API_URL);
  const endpoint = `${baseUrl}/api/rag/history/clear`;

  await axios.post(
    endpoint,
    { session_id: sessionId },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};
