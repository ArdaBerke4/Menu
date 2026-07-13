/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"VT323"', 'monospace'], // Nostaljik piksel fontumuz
      },
      colors: {
        brand: {
          light: '#E6D5B8', // Parşömen / Açık ahşap
          DEFAULT: '#8B5A2B', // Sıcak kahverengi
          dark: '#4A3728', // Koyu ahşap
        },
        surface: '#FDF6E3', // Sıcak kağıt/duvar rengi
        ink: '#2C1E16' // Siyah yerine çok koyu kahverengi
      },
      boxShadow: {
        // Eski oyunlardaki gibi sert ve kalın gölgeler
        'pixel': '4px 4px 0px 0px rgba(74, 55, 40, 1)',
        'pixel-sm': '2px 2px 0px 0px rgba(74, 55, 40, 1)',
      }
    },
  },
  plugins: [],
}