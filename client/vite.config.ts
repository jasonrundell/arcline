import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  // Validate required environment variables at build time
  const requiredEnvVars = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
  ] as const;

  for (const envVar of requiredEnvVars) {
    if (!env[envVar]) {
      throw new Error(
        `Missing required environment variable: ${envVar}. Please set it in your .env file or environment.`
      );
    }
  }

  return {
    plugins: [react()],
    server: {
      host: "::",
      port: 3000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
