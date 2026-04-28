/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAF7F2",
        accent: "#A67B5B",
        border: "#D6CFC6",
        text: {
          primary: "#2F241D",
          secondary: "#6E6158",
        },
        surface: "#FFFDF9",
        muted: "#F1EBE2",
      },
      boxShadow: {
        soft: "0 8px 20px rgba(59, 42, 28, 0.05)",
      },
      borderRadius: {
        card: "4px",
        control: "4px",
        promo: "10px",
      },
    },
  },
  plugins: [],
};
