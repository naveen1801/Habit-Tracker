/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // 🎨 CORE COLORS (Updated to match your new HabitCanvas branding)
      colors: {
        primary: "#94572e",             // Dark brown for main buttons
        "primary-container": "#ffaa75", // Soft orange for New Habit button
        secondary: "#059669",           // Green for completed states
        "secondary-container": "#d1fae5", // Light green backgrounds
        background: "#fcfdfd",          // Clean off-white app background
        surface: "#ffffff",
        text: "#2f3333",
        muted: "#5c605f",
      },

      // 🔤 FONT (Forces the premium Plus Jakarta Sans everywhere)
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },

      // 🔵 ROUNDED (Matches the exact curves from the Stitch design)
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",   // Added for the extra-rounded Habit Cards
      },

      // 🌫️ SHADOW (Soft modern UI drop shadow)
      boxShadow: {
        soft: "0 20px 40px rgba(47,51,51,0.05)",
      },
    },
  },
  plugins: [],
}