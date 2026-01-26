import { defineConfig, presetAttributify, presetTypography, presetWind4, transformerCompileClass, transformerVariantGroup } from 'unocss';
import { presetBootstrapBtn } from "./bootstrap_btn";

export default defineConfig({
  presets: [
    presetWind4() as any,
    presetTypography(),
    presetBootstrapBtn(),
    presetAttributify(),
  ],
  // By default, `.ts` and `.js` files are NOT extracted.
  // If you want to extract them, use the following configuration.
  // It's necessary to add the following configuration if you use shadcn-vue or shadcn-svelte.
  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        // include js/ts files
        "(components|src)/**/*.{js,ts,vue,jsx,tsx}",
        "./src/**/*.{js,jsx,ts,tsx,vue,md,mdx,html,svelte,astro}",
        "./src/**/*.server.{js,jsx,ts,tsx,vue,md,mdx,html,svelte,astro}",
        "../server/**/*.{ts,tsx,js,jsx,html}",
      ],
    },
  },
  theme: {
    colors: {
      primary: {
        DEFAULT: "#14a74b",
        50: "#effcf3",
        100: "#dcf9e2",
        200: "#bbf0c8",
        300: "#86efac",
        400: "#4ade80",
        500: "#14a74b",
        600: "#16a34a",
        700: "#15803d",
        800: "#166534",
        900: "#14532d",
        950: "#052e16",
        light: "#4ade80",
        active: "#15803d",
        "active-light": "#bbf0c8",
        dark: "#14532d",
      },
      accent: {
        DEFAULT: "#14a74b",
        50:  "#ecfdf3",
        100: "#d1fae5",
        200: "#a7f3d0",
        300: "#6ee7b7",
        400: "#34d399",
        500: "#14a74b",
        600: "#0f8a3d",
        700: "#0c6f33",
        800: "#095a2a",
        900: "#064622",
        950: "#032814",
      },
      success: {
        DEFAULT: "#22c55e",
        50: "#f0fdf4",
        100: "#dcfce7",
        200: "#bbf7d0",
        300: "#86efac",
        400: "#4ade80",
        500: "#22c55e",
        600: "#16a34a",
        700: "#15803d",
        800: "#166534",
        900: "#14532d",
        950: "#052e16",
        light: "#4ade80",
      },
      info: {
        DEFAULT: "#0ea5e9",
        50: "#f0f9ff",
        100: "#e0f2fe",
        200: "#bae6fd",
        300: "#7dd3fc",
        400: "#38bdf8",
        500: "#0ea5e9",
        600: "#0284c7",
        700: "#0369a1",
        800: "#075985",
        900: "#0c4a6e",
        950: "#082f49",
        light: "#38bdf8",
      },
      warning: {
        DEFAULT: "#f59e0b",
        50: "#fffbeb",
        100: "#fef3c7",
        200: "#fde68a",
        300: "#fcd34d",
        400: "#fbbf24",
        500: "#f59e0b",
        600: "#d97706",
        700: "#b45309",
        800: "#92400e",
        900: "#78350f",
        950: "#451a03",
        light: "#fbbf24",
      },
      danger: {
        DEFAULT: "#ef4444",
        50: "#fef2f2",
        100: "#fee2e2",
        200: "#fecaca",
        300: "#fca5a5",
        400: "#f87171",
        500: "#ef4444",
        600: "#dc2626",
        700: "#b91c1c",
        800: "#991b1b",
        900: "#7f1d1d",
        950: "#450a0a",
        light: "#f87171",
        active: "#dc2626",
      },
      secondary: {
        DEFAULT: "#fd7906",
        50: "#fff7ed",
        100: "#ffedd5",
        200: "#fed7aa",
        300: "#fdba74",
        400: "#fb923c",
        500: "#fd7906",
        600: "#ea580c",
        700: "#c2410c",
        800: "#9a3412",
        900: "#7c2d12",
        950: "#431407",
        light: "#fb923c",
        inverse: "#4b5675",
        dark: "#c2410c",
      },
      dark: {
        DEFAULT: "#111827",
        light: "#374151",
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937",
        900: "#111827",
        950: "#030712",
      },
      white: {
        DEFAULT: "#ffffff",
        light: "#f8f9fa",
      },
      light: {
        DEFAULT: "#f8f9fa",
        light: "#e2e6ea",
        dark: "#e2e6ea",
      },
      foreground: {
        DEFAULT: "#111827",
        light: "#374151",
        dark: "#000000",
      },
      muted: {
        DEFAULT: "#f3f4f6",
        light: "#fafafa",
        dark: "#e5e7eb",
      }
    },
    boxShadow: {
      "primary-box": "2px 2px 10px #aff6b8",
      "card-box": "0px 3px 4px 0px #00000008",
    },
    radius: {
      none: "0px",
      sm: "0.125rem", // 2px
      DEFAULT: "0.25rem", // 4px (áp dụng cho .rounded)
      md: "0.375rem", // 6px
      lg: "0.5rem", // 8px
      xl: "0.75rem", // 12px
      "2xl": "1rem", // 16px
      "3xl": "1.5rem", // 24px
      full: "9999px",
    },
  },
  shortcuts: [
    [
      "press-animated",
      "transition-all duration-200 ease-[cubic-bezier(.22,1,.36,1)] active:translate-y-0 active:scale-90 active:shadow-md",
    ],
    ["animate-loadingBar", ["animation", "loadingBar 1.5s linear infinite"]],
  ],
  transformers: [transformerVariantGroup(), transformerCompileClass({
    classPrefix: "_",
  })],
  preflights: [
    {
      getCSS: (context) => {
        return `
      :root {
        --font-sans: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
        --font-serif: 'Playfair Display', serif, 'Times New Roman', Times, serif;
      }
      :focus {
        outline-color: ${context.theme.colors?.primary?.active};
        outline-width: 1px
      }
		@keyframes loadingBar {
          0% { transform: translateX(-100%); }
		  50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
          .glass-nav {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .text-gradient {
            background: linear-gradient(135deg, #064e3b 0%, #10b981 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
            .fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

      `;
      },
    },
  ],
});
