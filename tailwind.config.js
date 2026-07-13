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
      },
      keyframes: {
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'translateY(1rem)' },
          '50%': { opacity: '1', transform: 'translateY(-0.25rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'scale-in': 'scale-in 0.2s ease-out forwards',
        'fade-in': 'fade-in 0.2s ease-out forwards',
        'bounce-in': 'bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      }
    },
  },
  plugins: [],
}