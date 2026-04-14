import axios from "axios";
import { getAiServiceBaseUrl } from "../../config/env";

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

export const queryRag = async (
  query: string,
  topK = 3,
  sessionId?: string,
): Promise<RagResponse> => {
  const baseUrl = getAiServiceBaseUrl();
  const endpoint = `${baseUrl}/api/rag/query`;

  const response = await axios.post<RagResponse>(endpoint, {
    query,
    top_k: topK,
    session_id: sessionId,
  });

  return response.data;
};

export const clearRagHistory = async (sessionId?: string): Promise<void> => {
  const baseUrl = getAiServiceBaseUrl();
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
