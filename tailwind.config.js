/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: '#0F766E',
                secondary: '#22C55E',
                accent: '#F59E0B',
                background: '#F8FAFC',
                surface: '#FFFFFF',
                textPrimary: '#0F172A',
                textSecondary: '#475569',
            },
        },
    },
    plugins: [],
}
