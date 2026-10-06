import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				mono: ['var(--font-dm-mono)', 'ui-monospace', 'monospace'],
				'ball-pill': ['var(--font-ball-pill)'],
				'so-cloudy': ['var(--font-so-cloudy)']
			},
			transitionProperty: {
				'filter': 'filter',
			},
			spacing: {
				'fluid-xs': 'var(--space-xs)',
				'fluid-sm': 'var(--space-sm)',
				'fluid-md': 'var(--space-md)',
				'fluid-lg': 'var(--space-lg)',
				'fluid-xl': 'var(--space-xl)',
				'fluid-2xl': 'var(--space-2xl)',
				'fluid-3xl': 'var(--space-3xl)',
			},
			fontSize: {
				'fluid-xs': 'var(--text-xs)',
				'fluid-sm': 'var(--text-sm)',
				'fluid-base': 'var(--text-base)',
				'fluid-lg': 'var(--text-lg)',
				'fluid-xl': 'var(--text-xl)',
				'fluid-2xl': 'var(--text-2xl)',
				'fluid-3xl': 'var(--text-3xl)',
				'fluid-4xl': 'var(--text-4xl)',
				'fluid-5xl': 'var(--text-5xl)',
				'fluid-6xl': 'var(--text-6xl)',
				'fluid-7xl': 'var(--text-7xl)',
				'fluid-8xl': 'var(--text-8xl)',
				'fluid-9xl': 'var(--text-9xl)',
				'title-sm': ['var(--title-sm)', { lineHeight: '1.1' }],
				'title-md': ['var(--title-md)', { lineHeight: '1.1' }],
				'title-lg': ['var(--title-lg)', { lineHeight: '1.1' }],
				'title-xl': ['var(--title-xl)', { lineHeight: '1.1' }],
				'title-2xl': ['var(--title-2xl)', { lineHeight: '1.1' }],
			},
			lineHeight: {
				'tight': 'var(--leading-tight)',
				'snug': 'var(--leading-snug)',
			},
			maxWidth: {
				'fluid-sm': 'var(--container-sm)',
				'fluid-md': 'var(--container-md)',
				'fluid-lg': 'var(--container-lg)',
				'fluid-xl': 'var(--container-xl)',
			},
			colors: {
				brand: {
					base: 'rgb(var(--brand-base-rgb) / <alpha-value>)',
					surface: 'rgb(var(--brand-surface-rgb) / <alpha-value>)',
					'soft-surface': 'rgb(var(--brand-charcoal-rgb) / <alpha-value>)',
					orange: 'rgb(var(--brand-red-rgb) / <alpha-value>)',
					red: 'rgb(var(--brand-red-rgb) / <alpha-value>)',
					blue: 'rgb(var(--brand-blue-rgb) / <alpha-value>)',
					green: 'rgb(var(--brand-green-rgb) / <alpha-value>)',
					text: 'rgb(var(--brand-chalk-rgb) / <alpha-value>)',
					'text-secondary': 'rgb(var(--brand-putty-rgb) / <alpha-value>)',
					border: 'rgb(var(--brand-border-rgb) / 0.16)',
					chalk: 'rgb(var(--brand-chalk-rgb) / <alpha-value>)',
					putty: 'rgb(var(--brand-putty-rgb) / <alpha-value>)',
					charcoal: 'rgb(var(--brand-charcoal-rgb) / <alpha-value>)',
				},
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundImage: {
				'topo': "url('/imgs/topo.svg')",
			}
		}
	},
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	plugins: [require("tailwindcss-animate")],

};

export default config;
