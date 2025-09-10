module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef8ff',
          100: '#d8eefd',
          200: '#b5dffc',
          300: '#83c8f8',
          400: '#45aaf2',
          500: '#0a53be',
          600: '#093a82',
          700: '#082c64',
          800: '#072452',
          900: '#061d42',
        },
        secondary: {
          50: '#fffaf0',
          100: '#fff0db',
          200: '#ffd9b3',
          300: '#ffc08a',
          400: '#ff9d5c',
          500: '#ff7b2e',
          600: '#f05a1d',
          700: '#c73d14',
          800: '#9e2f14',
          900: '#7f2615',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        }
      }
    },
  },
  plugins: [],
}