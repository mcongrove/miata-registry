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

import {
	autoUpdate,
	flip,
	FloatingPortal,
	offset,
	Placement,
	safePolygon,
	shift,
	useClick,
	useFloating,
	useHover,
	useInteractions,
} from '@floating-ui/react';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

type TooltipVariant = 'dark' | 'light';

type TooltipProps = {
	children: React.ReactNode;
	content: React.ReactNode;
	placement?: Placement;
	className?: string;
	variant?: TooltipVariant;
	interactive?: boolean;
};

const variantStyles: Record<TooltipVariant, string> = {
	dark: 'bg-brg-dark text-white',
	light: 'bg-white text-brg border border-brg-light shadow-md',
};

export const Tooltip = ({
	children,
	content,
	placement = 'top',
	className,
	variant = 'dark',
	interactive = false,
}: TooltipProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement,
		strategy: 'fixed',
		whileElementsMounted: autoUpdate,
		middleware: [offset(8), flip(), shift({ padding: 8 })],
	});

	const hover = useHover(
		context,
		interactive
			? {
					move: false,
					handleClose: safePolygon({ blockPointerEvents: true }),
					delay: { close: 80 },
				}
			: undefined
	);
	const click = useClick(context, {
		ignoreMouse: true,
	});

	const { getReferenceProps, getFloatingProps } = useInteractions([
		hover,
		click,
	]);

	return (
		<>
			<div
				className="inline-flex w-fit items-center"
				ref={refs.setReference}
				{...getReferenceProps()}
			>
				{children}
			</div>

			<FloatingPortal>
				{isOpen && (
					<div
						ref={refs.setFloating}
						style={floatingStyles}
						className={twMerge(
							'z-[52] rounded px-2 py-1 text-xs',
							variantStyles[variant],
							className
						)}
						{...getFloatingProps()}
					>
						{content}
					</div>
				)}
			</FloatingPortal>
		</>
	);
};
