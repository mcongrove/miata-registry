/**
 * Miata Registry
 * Copyright (C) 2024 Matthew Congrove
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

import { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	withArrow?: boolean;
	variant?: 'primary' | 'secondary' | 'tertiary';
	href?: string;
}

export const Button = ({
	className,
	children,
	onClick,
	withArrow = false,
	variant = 'primary',
	href,
	disabled,
	...props
}: ButtonProps) => {
	const buttonClassName = twMerge(
		'group flex items-center font-medium text-sm lg:text-base py-2 px-3 lg:py-3 lg:px-4 rounded-lg transition-colors',
		variant === 'primary'
			? 'bg-brg hover:bg-brg/90 disabled:bg-brg/50 disabled:cursor-not-allowed'
			: variant === 'secondary'
				? 'bg-brg-mid hover:bg-brg-mid/90 disabled:bg-brg-mid/50 disabled:cursor-not-allowed'
				: '',
		variant === 'tertiary'
			? 'text-brg hover:text-brg-mid disabled:text-brg/50 disabled:cursor-not-allowed'
			: 'text-white',
		className
	);

	if (href && !disabled) {
		return (
			<Link to={href} className={buttonClassName}>
				{children}
				{withArrow && (
					<span className="ml-2 transform group-hover:translate-x-1 transition-transform">
						→
					</span>
				)}
			</Link>
		);
	}

	return (
		<button
			onClick={onClick}
			className={buttonClassName}
			disabled={disabled}
			{...props}
		>
			{children}
			{withArrow && (
				<span className="ml-2 transform group-hover:translate-x-1 transition-transform">
					→
				</span>
			)}
		</button>
	);
};
