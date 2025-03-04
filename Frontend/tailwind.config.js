/** @type {import('tailwindcss').Config} */
const flowbite = require("flowbite-react/tailwind");
export default {
  darkMode : 'class',
  content: [
    "./*.html",
    "./src/**/*.{js,ts,jsx,tsx}",
   'node_modules/flowbite-react/lib/esm/**/*.js'
  ],
  plugins: [
  flowbite.plugin(),,
	],
  
}