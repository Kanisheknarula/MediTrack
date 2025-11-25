/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
    fontSize: {
    base: "18px",
    lg: "22px",
    xl: "28px",
    "2xl": "34px",
  },
  },
  plugins: [],
}
