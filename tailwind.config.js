/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./zh/*.html", "./ja/*.html"],
  // Classes added at runtime by JS (classList / className / template strings).
  safelist: [
    "hidden",
    "opacity-50",
    "hover:bg-gray-50",
    "text-green-600",
    "text-red-600",
    "text-red-500",
    "text-gray-500",
    "text-xs",
    "font-semibold",
    "font-bold",
    "p-2.5",
  ],
  theme: { extend: {} },
  plugins: [],
};
