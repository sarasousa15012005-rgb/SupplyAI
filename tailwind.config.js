/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
      },
      colors: {
        navy: {
          50: '#EFF4FA',
          100: '#DCE6F2',
          200: '#B9CCE4',
          300: '#8BA9CF',
          400: '#5C84B5',
          500: '#3B6797',
          600: '#2B4F7D',
          700: '#1E3D64',
          800: '#132B4A',
          900: '#0B1F3A',
          950: '#071526',
        },
      },
    },
  },
  plugins: [],
};
