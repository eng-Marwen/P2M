import { FormEvent, useEffect, useState } from "react";
import { queryRag } from "./ragApi";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_STORAGE_KEY = "ai-agent-chat-history";

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
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

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
      <div className="mx-auto flex h-[calc(100vh-9rem)] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <h1 className="text-xl font-semibold text-slate-900">
            AI Agent Chat
          </h1>
          <p className="text-sm text-slate-500">RAG endpoint: /api/rag/query</p>
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

        <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4">
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
    </main>
  );
};

export default AIAgentChatPage;
