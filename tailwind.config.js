/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
			colors: {
				brg: {
					DEFAULT: '#172E28',
					dark: '#10201C',
					mid: '#5D6D69',
					border: '#BAC1BF',
					light: '#E8EBEA',
				},
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
};
