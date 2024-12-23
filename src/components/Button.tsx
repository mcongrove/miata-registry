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

import { Link } from 'react-router-dom';

interface ButtonProps {
	className?: string;
	children: React.ReactNode;
	onClick?: () => void;
	withArrow?: boolean;
	variant?: 'primary' | 'secondary' | 'tertiary';
	href?: string;
}

export const Button: React.FC<ButtonProps> = ({
	className,
	children,
	onClick,
	withArrow = false,
	variant = 'primary',
	href,
}) => {
	const bgColor =
		variant === 'primary'
			? 'bg-brg hover:bg-brg/90'
			: variant === 'secondary'
				? 'bg-brg-mid hover:bg-brg-mid/90'
				: '';

	const textColor = variant === 'tertiary' ? 'text-gray-700' : 'text-white';
	const buttonClassName = `group flex items-center ${bgColor} ${textColor} font-medium py-3 px-4 rounded-lg transition-colors ${className || ''}`;

	if (href) {
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
		<button onClick={onClick} className={buttonClassName}>
			{children}
			{withArrow && (
				<span className="ml-2 transform group-hover:translate-x-1 transition-transform">
					→
				</span>
			)}
		</button>
	);
};
