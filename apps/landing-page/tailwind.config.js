/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/blog/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
}
