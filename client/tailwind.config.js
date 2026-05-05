/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sara: {
          50: "#f0faf4",
          100: "#d8f3e4",
          200: "#b3e6cb",
          300: "#7dd3ab",
          400: "#4aba87",
          500: "#2a9d6e",
          600: "#1e7d57",
          700: "#1a6547",
          800: "#18503a",
          900: "#154231",
        },
        gold: {
          50: "#fefce8",
          400: "#cda434",
          600: "#a17c1a",
        },
      },
      fontFamily: {
        display: ['"IBM Plex Sans Arabic"', "sans-serif"],
        body: ['"IBM Plex Sans Arabic"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
