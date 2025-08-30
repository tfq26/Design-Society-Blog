/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eerie-black': 'rgb(var(--color-eerie-black) / <alpha-value>)',
        'ash-gray': 'rgb(var(--color-ash-gray) / <alpha-value>)',
        'beige': 'rgb(var(--color-beige) / <alpha-value>)',
        'orange-wheel': 'rgb(var(--color-orange-wheel) / <alpha-value>)',
        'red': 'rgb(var(--color-red) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}