// admin/js/admin-app/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        'ptm-navy':       '#1B3A6B',
        'ptm-navy-light': '#2D5090',
        'ptm-gray':       '#6B7280',
        'ptm-red':        '#E53E3E',
        'ptm-green':      '#38A169',
        'ptm-teal':       '#38B2AC',
        'ptm-blue-modal': '#3182CE',
        'ptm-bg':         '#E2E8F0',
        'ptm-flag':       '#E67E22',
      },
    },
  },
  plugins: [],
}
