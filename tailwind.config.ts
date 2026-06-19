import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'da-navy': '#1a3a5c',
        'da-navy-dark': '#122840',
        'da-navy-light': '#254f7a',
        'da-gold': '#c9a84c',
        'da-gold-dark': '#a8882e',
        'da-gold-light': '#d9bc7a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
