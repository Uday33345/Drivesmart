
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e6e9ef',
          100: '#b3bdcd',
          200: '#8091ab',
          300: '#4d6589',
          400: '#1a3967',
          500: '#0a1628', // Background
          600: '#081220',
          700: '#060d18',
          800: '#040910',
          900: '#020408',
        },
        primary: {
          50: '#fff1e6',
          100: '#ffdfc2',
          200: '#ffcc99',
          300: '#ffb870',
          400: '#ffa347',
          500: '#f97316', // Orange
          600: '#c75c12',
          700: '#95450d',
          800: '#632e09',
          900: '#321704',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.05)',
          medium: 'rgba(255, 255, 255, 0.1)',
          strong: 'rgba(255, 255, 255, 0.15)',
        }
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(249, 115, 22, 0.3)',
        'glow-strong': '0 0 30px rgba(249, 115, 22, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
