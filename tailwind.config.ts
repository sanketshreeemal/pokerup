import type { Config } from "tailwindcss";
import theme from "./src/theme/theme";

const config: Config = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                ...theme.colors,
                border: theme.colors.border,
                background: theme.colors.background,
                primary: theme.colors.primary,
                secondary: theme.colors.secondary,
                success: theme.colors.success,
                warning: theme.colors.warning,
                error: theme.colors.error,
            },
            borderRadius: theme.borderRadius,
            fontFamily: {
                sans: [theme.typography.fontFamily],
            },
            fontSize: theme.typography.sizes,
            spacing: theme.spacing,
            boxShadow: theme.shadows,
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
