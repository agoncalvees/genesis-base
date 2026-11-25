import "@tanstack/react-start/server-only";

// Vite can set DEV in a build with a custom NODE_ENV, but strips the hot context.
export const hasViteDevServer = Boolean(import.meta.hot);
