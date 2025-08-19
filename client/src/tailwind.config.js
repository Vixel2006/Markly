// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    // Ensure this path includes your Sidebar component
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Common if your source code is in 'src'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }), // Add this line
    // Other plugins you might have
  ],
};
