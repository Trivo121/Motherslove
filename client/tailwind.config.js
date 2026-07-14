/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          terracotta: '#A96142',
          charcoal: '#2D3329',
          cream: '#FDF6F3',
          olivegrey: '#737373',
          sage: '#8A8B78',
          steel: '#98A4AC',
        },
        cardBg: {
          linen: '#E3DDD6',
          cotton: '#D5D0C8',
          silk: '#CDD6CE',
          raw: '#D9D5C9',
        }
      }
    },
  },
  plugins: [],
}
