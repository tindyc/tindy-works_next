/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-base)',
        'on-background': 'var(--text-primary)',
        primary: 'var(--text-primary)',
        'surface-container-low': 'var(--hover-bg)',
        'surface-container-highest': 'var(--border-strong)',
        'surface-container-lowest': 'var(--bg-base)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
        'headline-lg': ['Space Grotesk', 'sans-serif'],
        'headline-md': ['Space Grotesk', 'sans-serif'],
        'headline-sm': ['Space Grotesk', 'sans-serif'],
        'label-sm': ['Inter', 'sans-serif'],
        'body-lg': ['Inter', 'sans-serif'],
        'body-md': ['Inter', 'sans-serif'],
        'body-sm': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
