import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { queryRag, type RagHit } from "./ragApi";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_STORAGE_KEY = "ai-agent-chat-history";
const PROPOSED_HOUSES_STORAGE_KEY = "ai-agent-proposed-houses";

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
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(
      PROPOSED_HOUSES_STORAGE_KEY,
      JSON.stringify(proposedHouses),
    );
  }, [proposedHouses]);

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
      const result = await queryRag(contextualPrompt, 5);
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
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="flex h-[calc(100vh-9rem)] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <h1 className="text-xl font-semibold text-slate-900">
              AI Agent Chat
            </h1>
          </div>

          <section className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  message.role === "user"
                    ? "ml-auto bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {message.content}
              </div>
            ))}
            {loading && (
              <div className="max-w-[85%] rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                Thinking...
              </div>
            )}
          </section>

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 p-4"
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about properties, price, location, or recommendations..."
                className="h-11 flex-1 rounded-xl border border-slate-300 px-4 text-sm outline-none ring-indigo-500 focus:ring"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-11 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        <aside className="h-[calc(100vh-9rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Proposed houses
          </h2>
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
                  className="group rounded-2xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-800 leading-5">
                      {house.name || "Unnamed listing"}
                    </h3>
                    <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700">
                      {house.type || "N/A"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {house.address || "Address not available"}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                      $
                      {(house.discountedPrice && house.discountedPrice > 0
                        ? house.discountedPrice
                        : house.regularPrice) ?? "N/A"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                      Score {house.score.toFixed(2)}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-700 line-clamp-3">
                    {house.description || "No description"}
                  </p>

                  {house.listing_url ? (
                    <Link
                      to={house.listing_url}
                      className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition group-hover:bg-indigo-700"
                    >
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
