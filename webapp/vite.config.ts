import { defineConfig, loadEnv, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// Plugin to inject version from package.json into service worker
function injectServiceWorkerVersion(): Plugin {
  return {
    name: "inject-service-worker-version",
    writeBundle() {
      // Read version from package.json
      const packageJsonPath = path.resolve(__dirname, "./package.json");
      const packageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, "utf-8")
      );
      const version = packageJson.version;

      // Read the built service worker
      const swPath = path.resolve(__dirname, "./dist/sw.js");
      if (fs.existsSync(swPath)) {
        let swContent = fs.readFileSync(swPath, "utf-8");
        // Replace the version placeholder
        swContent = swContent.replace(/__VERSION__/g, version);
        // Write back the updated service worker
        fs.writeFileSync(swPath, swContent, "utf-8");
      }
    },
  };
}

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
    plugins: [react(), injectServiceWorkerVersion()],
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
