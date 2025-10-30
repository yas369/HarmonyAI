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
          purple: "#9B5DE5",
          aqua: "#00BBF9",
          highlight: "#FEE440"
        }
      },
      boxShadow: {
        glow: "0 0 25px rgba(155, 93, 229, 0.35)"
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
};
