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
	arrow,
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
import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

type TooltipVariant = 'dark' | 'light';

type TooltipProps = {
	children: React.ReactNode;
	content: React.ReactNode;
	placement?: Placement;
	className?: string;
	showArrow?: boolean;
	variant?: TooltipVariant;
	interactive?: boolean;
};

const variantStyles: Record<
	TooltipVariant,
	{ arrow: string; panel: string }
> = {
	dark: {
		panel: 'bg-brg-dark text-white',
		arrow: 'bg-brg-dark',
	},
	light: {
		panel: 'bg-white text-brg border border-brg-light shadow-md',
		arrow: 'bg-white',
	},
};

function arrowStaticSide(placement: Placement): string {
	const base = placement.split('-')[0];

	switch (base) {
		case 'top':
			return 'bottom';
		case 'bottom':
			return 'top';
		case 'left':
			return 'right';
		case 'right':
			return 'left';
		default:
			return 'top';
	}
}

export const Tooltip = ({
	children,
	content,
	placement = 'top',
	className,
	showArrow = true,
	variant = 'dark',
	interactive = false,
}: TooltipProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const arrowRef = useRef(null);

	const { refs, floatingStyles, context, middlewareData } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement,
		middleware: [
			offset(showArrow ? (interactive ? 6 : 10) : 8),
			flip(),
			shift({ padding: 8 }),
			...(showArrow ? [arrow({ element: arrowRef })] : []),
		],
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

	const styles = variantStyles[variant];
	const arrowData = middlewareData.arrow;
	const staticSide = arrowStaticSide(context.placement);

	return (
		<>
			<div
				className="w-fit h-fit"
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
						className="relative z-[52]"
					>
						{showArrow && arrowData && (
							<div
								ref={arrowRef}
								className="pointer-events-none absolute z-0"
								style={{
									left:
										arrowData.x != null
											? `${arrowData.x}px`
											: undefined,
									top:
										arrowData.y != null
											? `${arrowData.y}px`
											: undefined,
									[staticSide]:
										variant === 'light' ? '-6px' : '-4px',
								}}
							>
								{variant === 'light' ? (
									<>
										<div className="absolute left-0 top-0 size-3 rotate-45 bg-brg-light" />
										<div className="absolute left-0.5 top-0.5 size-2.5 rotate-45 bg-white" />
									</>
								) : (
									<div
										className={twMerge(
											'absolute left-0 top-0 size-2 rotate-45',
											styles.arrow
										)}
									/>
								)}
							</div>
						)}

						<div
							className={twMerge(
								'relative z-10 rounded px-2 py-1 text-xs',
								styles.panel,
								className
							)}
							{...(interactive ? getFloatingProps() : {})}
						>
							{content}
						</div>
					</div>
				)}
			</FloatingPortal>
		</>
	);
};
