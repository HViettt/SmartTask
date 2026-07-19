/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          base: 'var(--bg-base)',
          card: 'var(--bg-card)',
          border: 'var(--border-main)',
          primary: 'var(--primary)',
          'primary-text': 'var(--primary-text)',
          high: 'var(--high)',
          'high-text': 'var(--high-text)',
          medium: 'var(--medium)',
          'medium-text': 'var(--medium-text)',
          low: 'var(--low)',
          'low-text': 'var(--low-text)',
          main: 'var(--text-main)',
          sub: 'var(--text-sub)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    }
  },
  plugins: [],
}
