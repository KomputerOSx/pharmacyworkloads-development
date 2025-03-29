/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-sans)", "sans-serif"],
            },
            colors: {
                background: "#F7F8F7",
                foreground: "#181B19",
                neutral: {
                    50: "#f9faf9",
                    100: "#f4f5f4",
                    200: "#e5e6e5",
                    300: "#d3d5d3",
                    400: "#a1a3a1",
                    500: "#717371",
                    600: "#515452",
                    700: "#3e413f",
                    800: "#252826",
                    900: "#161917",
                },
                brand: {
                    50: "#eff6ff",
                    100: "#dbeafe",
                    200: "#bfdbfe",
                    300: "#93c5fd",
                    400: "#60a5fa",
                    500: "#3b82f6",
                    600: "#2563eb",
                    700: "#1d4ed8",
                    800: "#1e40af",
                    900: "#1e3a8a",
                },
                highlight: {
                    50: "#faf5ff",
                    100: "#f3e8ff",
                    200: "#e9d5ff",
                    300: "#d8b4fe",
                    400: "#c084fc",
                    500: "#a855f7",
                    600: "#9333ea",
                    700: "#7e22ce",
                    800: "#6b21a8",
                    900: "#581c87",
                },
            },
            borderRadius: {
                sm: "0.1094rem",
                default: "0.2188rem",
                md: "0.3281rem",
                lg: "0.4375rem",
                xl: "0.6875rem",
                "2xl": "1.1875rem",
                "3xl": "1.7813rem",
            },
            keyframes: {
                "accordion-down": {
                    from: {
                        height: "0",
                    },
                    to: {
                        height: "var(--radix-accordion-content-height)",
                    },
                },
                "accordion-up": {
                    from: {
                        height: "var(--radix-accordion-content-height)",
                    },
                    to: {
                        height: "0",
                    },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
