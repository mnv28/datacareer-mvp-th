
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Roboto', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#091540',
					light: '#3D518C',
					lighter: '#7692FF',
					accent: '#E9724C',
					pastel: '#ABD3FA',
				},
				secondary: {
					DEFAULT: '#FFFFFF',
					light: '#CCCCCC',
					mid: '#404032',
					dark: '#151515',
				},
				datacareer: {
					darkBlue: '#091540',
					blue: '#3D518C',
					lightBlue: '#7692FF',
					orange: '#E9724C',
					skyBlue: '#ABD3FA',
				},
				difficulty: {
					beginner: '#4CAF50',
					intermediate: '#FF9800',
					advanced: '#F44336',
				},
				status: {
					solved: '#4CAF50',
					wrong: '#F44336',
					unattempted: '#9E9E9E',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-light': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-light': 'pulse-light 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			},
			backgroundImage: {
				'gradient-01': 'linear-gradient(to right, #3D518C, #7692FF, #ABD3FA)',
				'gradient-02': 'linear-gradient(to right, #3D518C, #ABD3FA)',
				'gradient-03': 'linear-gradient(to right, #3D518C, #7692FF)',
				'gradient-04': 'linear-gradient(to right, #7692FF, #ABD3FA)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
