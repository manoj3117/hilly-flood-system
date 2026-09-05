/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cmd: {
          bg: "#0b0f19",
          card: "#111827",
          panel: "#161f30",
          border: "#1f2937",
          borderGlow: "#374151",
          text: "#f3f4f6",
          muted: "#9ca3af"
        },
        risk: {
          safe: "#10b981",
          watch: "#f59e0b",
          warning: "#f97316",
          critical: "#ef4444"
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace', 'ui-monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
