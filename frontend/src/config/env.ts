declare global {
  interface Window {
    __ENV__?: {
      API_URL: string;
      FIREBASE_API_KEY: string;
    };
  }
}

// Check if __ENV__ values are actually substituted (not placeholders)
const isEnvSubstituted = (value: string | undefined): boolean => {
  return value !== undefined && !value.includes("${");
};

// Runtime config (Docker) takes priority, fallback to build-time env vars (local dev)
export const ENV = {
  API_URL: isEnvSubstituted(window.__ENV__?.API_URL)
    ? window.__ENV__!.API_URL
    : import.meta.env.VITE_API_URL || "http://localhost:4000",
  FIREBASE_API_KEY: isEnvSubstituted(window.__ENV__?.FIREBASE_API_KEY)
    ? window.__ENV__!.FIREBASE_API_KEY
    : import.meta.env.VITE_FIRE_BASE_API_KEY,
};
