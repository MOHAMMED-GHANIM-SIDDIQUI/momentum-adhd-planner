import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        momentum: {
          primary: '#3B82F6',
          accent: '#A855F7',
          success: '#10B981',
          warning: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
}
export default config
