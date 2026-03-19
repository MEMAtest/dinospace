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
        "confetti-fall": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
        "confetti-fall-left": {
          "0%": { transform: "translateY(0) translateX(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) translateX(-100px) rotate(720deg)", opacity: "0" },
        },
        "confetti-fall-right": {
          "0%": { transform: "translateY(0) translateX(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) translateX(100px) rotate(720deg)", opacity: "0" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "count-up": {
          "0%": { transform: "scale(1.5)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(168,85,247,0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(168,85,247,0.6)" },
        },
        "cell-correct": {
          "0%": { transform: "scale(0.8)", boxShadow: "0 0 0 rgba(34,197,94,0)" },
          "50%": { transform: "scale(1.12)", boxShadow: "0 0 16px rgba(34,197,94,0.5)" },
          "100%": { transform: "scale(1)", boxShadow: "0 0 8px rgba(34,197,94,0.2)" },
        },
        "piece-bounce": {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.3)" },
          "60%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        "ring-expand": {
          "0%": { transform: "scale(0.5)", opacity: "0.8" },
          "100%": { transform: "scale(8)", opacity: "0" },
        },
        "cell-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
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
        "confetti-fall": "confetti-fall 2s ease-in forwards",
        "confetti-fall-left": "confetti-fall-left 2.5s ease-in forwards",
        "confetti-fall-right": "confetti-fall-right 2.5s ease-in forwards",
        "fade-out": "fade-out 0.15s ease-out forwards",
        "count-up": "count-up 0.3s ease-out both",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "cell-correct": "cell-correct 0.4s ease-out",
        "piece-bounce": "piece-bounce 0.5s ease-out",
        "ring-expand": "ring-expand 0.8s ease-out forwards",
        "cell-pulse": "cell-pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
