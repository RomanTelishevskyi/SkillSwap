/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    // Это важно! Tailwind должен сканировать все ваши файлы JavaScript/TypeScript
    // и React-компоненты на наличие классов.
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
