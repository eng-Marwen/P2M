import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

// Use dynamic import to ensure dotenv runs before server.ts executes
await import("./server.js");
