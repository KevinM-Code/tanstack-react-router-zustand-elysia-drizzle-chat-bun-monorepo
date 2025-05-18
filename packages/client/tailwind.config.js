/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    "./app/routes/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
}

