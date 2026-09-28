import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        paper: "#f3f4f7",
        ink: "#161a2b",
        accent: "#4a3ff0",
      },
    },
  },
  plugins: [],
};

export default config;
