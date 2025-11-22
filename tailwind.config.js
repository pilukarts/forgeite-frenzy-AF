module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx}', // fallback
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Exo 2', 'sans-serif'],
        headline: ['Orbitron', 'sans-serif'],
        code: ['monospace'],
      },
      // ... (keep your colors/extends from the config you pasted) ...
    },
  },
  plugins: [require('tailwindcss-animate')],
};