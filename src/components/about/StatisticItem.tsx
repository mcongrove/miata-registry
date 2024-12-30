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

import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface StatisticItemProps {
	className?: string;
	label: string;
	value: number | Promise<number>;
}

export const StatisticItem = ({
	className,
	label,
	value,
}: StatisticItemProps) => {
	const [count, setCount] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (value instanceof Promise) {
			value.then((result) => {
				setCount(result);
				setLoading(false);
			});
		} else {
			setCount(value);
			setLoading(false);
		}
	}, [value]);

	return (
		<div className={twMerge('flex flex-col items-center gap-2', className)}>
			{loading || !count ? (
				<div className="h-12 w-16 bg-brg-light animate-pulse rounded" />
			) : (
				<span className="text-4xl lg:text-5xl font-medium text-brg tracking-tight">
					{count.toLocaleString()}
				</span>
			)}
			<span className="text-sm font-medium text-brg-mid text-center">
				{label}
			</span>
		</div>
	);
};
