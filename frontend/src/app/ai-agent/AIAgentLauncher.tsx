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
      className="fixed bottom-6 right-6 z-1000 inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
    >
      <FiMessageCircle className="h-6 w-6" />
    </button>
  );
};

export default AIAgentLauncher;
