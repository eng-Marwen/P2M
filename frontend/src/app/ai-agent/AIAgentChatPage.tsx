import { FormEvent, useEffect, useState } from "react";
import {
  FiHome,
  FiMapPin,
  FiMessageSquare,
  FiTrash2,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { clearRagHistory, queryRag, type RagHit } from "./ragApi";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_STORAGE_KEY = "ai-agent-chat-history";
const PROPOSED_HOUSES_STORAGE_KEY = "ai-agent-proposed-houses";
const RAG_SESSION_ID_STORAGE_KEY = "ai-agent-rag-session-id";

const DEFAULT_WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I am your real-estate AI assistant. Ask me anything about available listings.",
};

const buildContextualQuery = (history: Message[], currentQuestion: string) => {
  const recent = history.slice(-8);

  if (recent.length === 0) {
    return currentQuestion;
  }

  const transcript = recent
    .map(
      (message) =>
        `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`,
    )
    .join("\n");

  return [
    "Continue this conversation using previous context when needed.",
    "Conversation history:",
    transcript,
    `Current user message: ${currentQuestion}`,
  ].join("\n\n");
};

const AIAgentChatPage = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposedHouses, setProposedHouses] = useState<RagHit[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    DEFAULT_WELCOME_MESSAGE,
  ]);
  const [ragSessionId, setRagSessionId] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Message[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed);
      }
    } catch {
      setMessages([DEFAULT_WELCOME_MESSAGE]);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(PROPOSED_HOUSES_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as RagHit[];
      if (Array.isArray(parsed)) {
        setProposedHouses(parsed);
      }
    } catch {
      setProposedHouses([]);
    }
  }, []);

  useEffect(() => {
    const storedSessionId = localStorage.getItem(RAG_SESSION_ID_STORAGE_KEY);
    if (storedSessionId) {
      setRagSessionId(storedSessionId);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(
      PROPOSED_HOUSES_STORAGE_KEY,
      JSON.stringify(proposedHouses),
    );
  }, [proposedHouses]);

  useEffect(() => {
    if (!ragSessionId) {
      localStorage.removeItem(RAG_SESSION_ID_STORAGE_KEY);
      return;
    }
    localStorage.setItem(RAG_SESSION_ID_STORAGE_KEY, ragSessionId);
  }, [ragSessionId]);

  const handleClearChatHistory = async () => {
    try {
      await clearRagHistory(ragSessionId ?? undefined);
    } catch {
      // ignore backend clear errors and still clear local state
    }

    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setProposedHouses([]);
    setRagSessionId(null);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(PROPOSED_HOUSES_STORAGE_KEY);
    localStorage.removeItem(RAG_SESSION_ID_STORAGE_KEY);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const question = input.trim();
    if (!question || loading) return;

    const historyForPrompt = messages.filter(
      (message) => message.content !== DEFAULT_WELCOME_MESSAGE.content,
    );
    const contextualPrompt = buildContextualQuery(historyForPrompt, question);

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const result = await queryRag(
        contextualPrompt,
        5,
        ragSessionId ?? undefined,
      );
      if (result.session_id) {
        setRagSessionId(result.session_id);
      }
      setProposedHouses(result.hits || []);
      const suffix =
        result.total_hits > 0
          ? `\n\nMatched listings: ${result.total_hits}`
          : "";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `${result.answer}${suffix}` },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I could not reach the AI service right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-indigo-50 via-slate-50 to-white px-4 py-8">
      <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="relative flex h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-3xl border border-indigo-100/80 bg-white/95 shadow-xl backdrop-blur-sm">
          <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-indigo-100 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-violet-100 blur-3xl" />

          <div className="relative border-b border-slate-200/70 p-5">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-100 px-4 py-1.5 text-sm font-extrabold tracking-wide text-indigo-800 shadow-sm">
              <FiZap className="h-4 w-4" />
              SMART AI
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AI Agent Chat
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Ask naturally. Get tailored listings, prices, and location
              insights.
            </p>
            <button
              type="button"
              onClick={handleClearChatHistory}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            >
              <FiTrash2 className="h-3.5 w-3.5" />
              Delete chat history
            </button>
          </div>

          <section className="relative flex-1 space-y-3 overflow-y-auto p-5">
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`max-w-[88%] rounded-lg px-2 py-1.5 text-xs whitespace-pre-wrap shadow-sm ${
                  message.role === "user"
                    ? "ml-auto bg-linear-to-br from-indigo-600 to-indigo-700 text-white"
                    : "border border-slate-200 bg-white text-slate-800"
                }`}
              >
                <div className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider opacity-70">
                  {message.role === "user" ? (
                    <>
                      <FiMessageSquare className="h-3 w-3" /> You
                    </>
                  ) : (
                    <>
                      <FiZap className="h-3 w-3" /> AI Agent
                    </>
                  )}
                </div>
                {message.content}
              </article>
            ))}
            {loading && (
              <div className="max-w-[88%] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                  <FiZap className="h-3.5 w-3.5" /> AI Agent
                </div>
                Thinking...
              </div>
            )}
          </section>

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200/70 bg-white/90 p-4"
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about properties, price, location, or recommendations..."
                className="h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none ring-indigo-500 transition focus:border-indigo-400 focus:ring"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-10 min-w-16 rounded-xl border-2 border-indigo-800 bg-linear-to-br from-fuchsia-600 via-indigo-600 to-blue-600 px-4 text-base font-bold text-white shadow-md transition hover:scale-105 hover:from-fuchsia-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        <aside className="h-[calc(100vh-9rem)] overflow-y-auto rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-xl backdrop-blur-sm">
          <h2 className="text-lg font-bold text-slate-900">Proposed houses</h2>
          <p className="mt-1 text-xs text-slate-500">
            Top matches from your latest AI query
          </p>

          <div className="mt-4 space-y-3">
            {proposedHouses.length === 0 ? (
              <p className="text-sm text-slate-500">
                No proposed houses yet. Ask the AI for recommendations.
              </p>
            ) : (
              proposedHouses.map((house, index) => (
                <article
                  key={`${house.name || "house"}-${index}`}
                  className="group rounded-2xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-sm leading-5 font-semibold text-slate-800">
                      {house.name || "Unnamed listing"}
                    </h3>
                    <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700">
                      {house.type || "N/A"}
                    </span>
                  </div>

                  <p className="flex items-center gap-1.5 text-xs text-slate-500 line-clamp-2">
                    <FiMapPin className="h-3.5 w-3.5 shrink-0" />
                    {house.address || "Address not available"}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                      {(house.discountedPrice && house.discountedPrice > 0
                        ? house.discountedPrice
                        : house.regularPrice) ?? "N/A"}{" "}
                      TND
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                      <FiTrendingUp className="h-3.5 w-3.5" />
                      Score {house.score.toFixed(2)}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-700 line-clamp-3">
                    {house.description || "No description"}
                  </p>

                  {house.listing_url ? (
                    <Link
                      to={house.listing_url}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-linear-to-br from-indigo-600 to-indigo-700 px-3 py-1.5 text-xs font-medium text-white transition group-hover:from-indigo-700 group-hover:to-indigo-800"
                    >
                      <FiHome className="h-3.5 w-3.5" />
                      View details
                    </Link>
                  ) : (
                    <span className="mt-4 inline-flex text-xs text-slate-400">
                      Details unavailable
                    </span>
                  )}
                </article>
              ))
            )}
          </div>
        </aside>
      </div>
    </main>
  );
};

export default AIAgentChatPage;
