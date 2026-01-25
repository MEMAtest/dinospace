/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Fredoka"', '"Baloo 2"', "ui-sans-serif", "system-ui", "sans-serif"],
        comic: ['"Baloo 2"', '"Fredoka"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        pop: {
          "0%": { transform: "scale(0)" },
          "100%": { transform: "scale(1)" },
        },
        "bounce-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "drift-left": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-30px)" },
        },
        "drift-right": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(30px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        "float-up": {
          "0%": { transform: "translateY(0) scale(0.8)", opacity: "0" },
          "15%": { opacity: "1" },
          "100%": { transform: "translateY(-90px) scale(1.2)", opacity: "0" },
        },
      },
      animation: {
        "bounce-slow": "bounce-slow 2.6s ease-in-out infinite",
        "fade-in-down": "fade-in-down 0.6s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
        wiggle: "wiggle 1s ease-in-out infinite",
        "pop-in": "pop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "bounce-up": "bounce-up 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "drift-left": "drift-left 6s ease-in-out infinite",
        "drift-right": "drift-right 7s ease-in-out infinite",
        shake: "shake 0.45s ease-in-out",
        "float-up": "float-up 1.2s ease-out forwards",
      },
    },
  },
  plugins: [],
}
