/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        purple: {
          DEFAULT: '#7c3aed',
          light: '#f5f3ff',
          dark: '#5b21b6',
        },
        coral: '#f43f5e',
        ink: '#111827',
        gray: {
          DEFAULT: '#6b7280',
          light: '#9ca3af',
        },
        border: '#e5e7eb',
        surface: '#f9fafb',
      },
      backgroundImage: {
        'ek-grad': 'linear-gradient(135deg, #f43f5e, #7c3aed)',
      },
    },
  },
  plugins: [],
};
