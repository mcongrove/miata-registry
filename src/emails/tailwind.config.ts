/**
 * Miata Registry
 * Copyright (C) 2024-2026 Matthew Congrove
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import type { TailwindConfig } from 'react-email';

export default {
	theme: {
		fontSize: {
			xs: ['12px', { lineHeight: '16px' }],
			sm: ['14px', { lineHeight: '20px' }],
			base: ['16px', { lineHeight: '24px' }],
			lg: ['18px', { lineHeight: '28px' }],
			xl: ['20px', { lineHeight: '28px' }],
			'2xl': ['24px', { lineHeight: '32px' }],
			'3xl': ['30px', { lineHeight: '36px' }],
			'4xl': ['36px', { lineHeight: '36px' }],
			'5xl': ['48px', { lineHeight: '1' }],
			'6xl': ['60px', { lineHeight: '1' }],
			'7xl': ['72px', { lineHeight: '1' }],
			'8xl': ['96px', { lineHeight: '1' }],
			'9xl': ['144px', { lineHeight: '1' }],
		},
		spacing: {
			px: '1px',
			0: '0',
			0.5: '2px',
			1: '4px',
			1.5: '6px',
			2: '8px',
			2.5: '10px',
			3: '12px',
			3.5: '14px',
			4: '16px',
			5: '20px',
			6: '24px',
			7: '28px',
			8: '32px',
			9: '36px',
			10: '40px',
			11: '44px',
			12: '48px',
			14: '56px',
			16: '64px',
			20: '80px',
			24: '96px',
			28: '112px',
			32: '128px',
			36: '144px',
			40: '160px',
			44: '176px',
			48: '192px',
			52: '208px',
			56: '224px',
			60: '240px',
			64: '256px',
			72: '288px',
			80: '320px',
			96: '384px',
		},
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
} satisfies TailwindConfig;
