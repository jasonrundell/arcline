import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "arc-black": "#1a1a22",
        "arc-orange": "#ff6b32",
        "arc-gray": "#8f8f8f",
        "arc-sand": "#ffe7a0",
        "arc-cyan": "#00daff",
        "arc-olive": "#273110",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 218, 255, 0.3)",
        "glow-orange": "0 0 20px rgba(255, 107, 50, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;

