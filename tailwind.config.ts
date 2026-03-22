import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Sora", "Segoe UI", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Sora", "sans-serif"]
      },
      boxShadow: {
        glow: "0 24px 80px rgba(15, 23, 42, 0.16)"
      },
      colors: {
        ink: {
          950: "#07111F"
        }
      }
    }
  },
  plugins: []
};

export default config;
