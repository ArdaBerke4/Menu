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
        ink: '#2C1E16', // Siyah yerine çok koyu kahverengi
        
        // Admin UI Colors
        admin: {
          bg: 'var(--admin-bg)',
          surface: 'var(--admin-surface)',
          border: 'var(--admin-border)',
          text: 'var(--admin-text)',
          'text-muted': 'var(--admin-text-muted)',
          primary: 'var(--admin-primary)',
          'primary-hover': 'var(--admin-primary-hover)',
          'primary-text': 'var(--admin-primary-text)',
          danger: 'var(--admin-danger)',
          'danger-hover': 'var(--admin-danger-hover)',
          'danger-text': 'var(--admin-danger-text)',
          'primary-faint': 'var(--admin-primary-faint)',
          'danger-faint': 'var(--admin-danger-faint)',
          sidebar: 'var(--admin-sidebar)',
          'sidebar-hover': 'var(--admin-sidebar-hover)',
        }
      },
      boxShadow: {
        // Eski oyunlardaki gibi sert ve kalın gölgeler
        'pixel': '4px 4px 0px 0px rgba(74, 55, 40, 1)',
        'pixel-sm': '2px 2px 0px 0px rgba(74, 55, 40, 1)',
        
        // Admin UI Shadows
        'admin-pixel': 'var(--admin-shadow)',
        'admin-pixel-sm': 'var(--admin-shadow-sm)',
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
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        }
      },
      animation: {
        'scale-in': 'scale-in 0.2s ease-out forwards',
        'fade-in': 'fade-in 0.2s ease-out forwards',
        'bounce-in': 'bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}