/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      typography: {
        // Keep inline <strong> neutral (same color as the rest of prose),
        // just heavier so it reads as emphasis. Only the `strong` rule is touched.
        DEFAULT: {
          css: {
            strong: {
              fontWeight: '800',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
  darkMode: 'class',
}