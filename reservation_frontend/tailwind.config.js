/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        // Primary — Teal/Cyan (#087592 to #0CC0DF)
        primary: {
          50:  '#E6F7FA',
          100: '#B3EBF5',
          200: '#80DFF0',
          300: '#4DD3EB',
          400: '#0CC0DF',
          500: '#0CC0DF',
          600: '#087592',
          700: '#065E75',
          800: '#044758',
          900: '#02303B',
          950: '#01181E',
        },
        // Accent — Violet
        accent: {
          50:  'hsl(262, 100%, 97%)',
          100: 'hsl(262, 100%, 94%)',
          200: 'hsl(262, 98%, 87%)',
          300: 'hsl(262, 96%, 76%)',
          400: 'hsl(262, 93%, 65%)',
          500: 'hsl(262, 90%, 56%)',
          600: 'hsl(262, 84%, 48%)',
          700: 'hsl(262, 80%, 40%)',
          800: 'hsl(262, 76%, 32%)',
          900: 'hsl(262, 72%, 24%)',
        },
        // Success — Emerald
        success: {
          400: 'hsl(158, 70%, 48%)',
          500: 'hsl(158, 65%, 40%)',
          600: 'hsl(158, 60%, 32%)',
        },
        // Warning — Amber
        warning: {
          400: 'hsl(43, 96%, 56%)',
          500: 'hsl(38, 92%, 50%)',
          600: 'hsl(32, 95%, 44%)',
        },
        // Dark surface for dark mode
        surface: {
          50:  'hsl(220, 30%, 98%)',
          100: 'hsl(220, 28%, 94%)',
          200: 'hsl(220, 26%, 88%)',
          700: 'hsl(220, 20%, 18%)',
          800: 'hsl(220, 22%, 13%)',
          900: 'hsl(220, 25%, 9%)',
          950: 'hsl(220, 28%, 6%)',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(8, 117, 146, 0.4)',
        'glow-accent': '0 0 20px rgba(12, 192, 223, 0.4)',
        'card': '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-gentle': 'bounceGentle 1s ease-in-out infinite',
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
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(8, 117, 146, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(8, 117, 146, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
}