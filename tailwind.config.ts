import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                // New Blue-Purple Color System
                primary: {
                    DEFAULT: "#6E8CFB",
                    50: "#F0F3FF",
                    100: "#E5EAFF",
                    200: "#D0DBFF",
                    300: "#B3C3FF",
                    400: "#8FA5FE",
                    500: "#6E8CFB",
                    600: "#5570E8",
                    700: "#4158C5",
                    800: "#3447A0",
                    900: "#2A3880",
                    950: "#1A2350",
                },
                secondary: {
                    DEFAULT: "#636CCB",
                    50: "#ECEEFF",
                    100: "#DDE1FF",
                    200: "#C4CBFF",
                    300: "#A5AEFF",
                    400: "#8289E8",
                    500: "#636CCB",
                    600: "#4F58AF",
                    700: "#3E4690",
                    800: "#323975",
                    900: "#282F5E",
                    950: "#181D38",
                },
                surface: {
                    DEFAULT: "#50589C",
                    50: "#E8EAFF",
                    100: "#D5D9FF",
                    200: "#B5BCFF",
                    300: "#8F99FF",
                    400: "#6C77D4",
                    500: "#50589C",
                    600: "#3F4680",
                    700: "#323768",
                    800: "#282D55",
                    900: "#1F2444",
                    950: "#13162A",
                },
                deep: {
                    DEFAULT: "#3C467B",
                    50: "#DFE3FF",
                    100: "#C8CFFF",
                    200: "#A3ADFF",
                    300: "#7B87F5",
                    400: "#5A64C8",
                    500: "#3C467B",
                    600: "#2F3761",
                    700: "#252B4D",
                    800: "#1D223E",
                    900: "#171B32",
                    950: "#0D0F1F",
                },
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
            },
            animation: {
                blob: "blob 7s infinite",
                'fade-in': 'fadeIn 0.3s ease-in',
                'slide-up': 'slideUp 0.4s ease-out',
                'slide-down': 'slideDown 0.4s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                blob: {
                    "0%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                    "33%": {
                        transform: "translate(30px, -50px) scale(1.1)",
                    },
                    "66%": {
                        transform: "translate(-20px, 20px) scale(0.9)",
                    },
                    "100%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(110, 140, 251, 0.4)' },
                    '100%': { boxShadow: '0 0 30px rgba(110, 140, 251, 0.6), 0 0 40px rgba(99, 108, 203, 0.3)' },
                },
            },
            borderRadius: {
                '4xl': '2rem',
            },
            boxShadow: {
                'glow-primary': '0 0 20px rgba(110, 140, 251, 0.4)',
                'glow-primary-lg': '0 0 30px rgba(110, 140, 251, 0.5), 0 0 40px rgba(99, 108, 203, 0.3)',
                'glow-secondary': '0 0 15px rgba(99, 108, 203, 0.3)',
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'surface': '0 4px 12px rgba(60, 70, 123, 0.3)',
                'deep': '0 8px 24px rgba(60, 70, 123, 0.4)',
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
};

export default config;
