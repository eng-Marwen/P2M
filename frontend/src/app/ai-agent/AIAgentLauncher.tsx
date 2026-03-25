import { FiMessageCircle } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

const AIAgentLauncher = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const onChatPage = location.pathname === "/ai-agent";

  if (onChatPage) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Open AI chat"
      title="Open AI chat"
      onClick={() => navigate("/ai-agent")}
      className="fixed bottom-6 right-6 z-1000 inline-flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 via-indigo-500 to-cyan-500 text-white shadow-2xl ring-4 ring-fuchsia-200/80 transition-transform duration-200 hover:scale-105 hover:from-fuchsia-600 hover:via-indigo-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-fuchsia-300"
    >
      <FiMessageCircle className="h-9 w-9 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
      <span className="absolute -right-3 -top-2 rounded-full border-2 border-white bg-linear-to-r from-yellow-300 to-orange-300 px-2.5 py-1 text-[11px] font-black leading-none tracking-wide text-rose-900 shadow-lg">
        SMART AI
      </span>
    </button>
  );
};

export default AIAgentLauncher;
