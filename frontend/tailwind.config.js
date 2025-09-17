/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#f97316', // Laranja vibrante para botão
        background: {
          light: '#f3f4f6', // Cinza claro
          gradient: 'linear-gradient(to right, #60a5fa, #a78bfa)', // Azul para lilás
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
