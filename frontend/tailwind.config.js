/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Nunito", "sans-serif"]
      },
      colors: {
        brand: {
          purple: "#FF6B35",
          aqua: "#FFA62B",
          highlight: "#FFD166"
        }
      },
      boxShadow: {
        glow: "0 0 25px rgba(255, 107, 53, 0.35)"
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
};
