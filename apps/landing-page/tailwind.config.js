/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/blog/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
