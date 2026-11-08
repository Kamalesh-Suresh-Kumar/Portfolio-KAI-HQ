import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => {
  if (command === "build") {
    process.env.NODE_ENV = "production";
  }
  return {
    plugins: [react()],
    base: process.env.GITHUB_ACTIONS ? "/Portfolio-KAI-HQ/" : "/",
    build: {
      manifest: true,
    },
    server: {
      host: "0.0.0.0",
      port: 3000,
      allowedHosts: true,
    },
  };
});
