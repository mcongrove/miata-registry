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

import {
	arrow,
	flip,
	FloatingPortal,
	offset,
	Placement,
	shift,
	useClick,
	useFloating,
	useHover,
	useInteractions,
} from '@floating-ui/react';
import { useRef, useState } from 'react';

type TooltipProps = {
	children: React.ReactNode;
	content: React.ReactNode;
	placement?: Placement;
	className?: string;
};

export const Tooltip = ({
	children,
	content,
	placement = 'top',
	className,
}: TooltipProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const arrowRef = useRef(null);

	const { refs, floatingStyles, context, middlewareData } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement,
		middleware: [
			offset(8),
			flip(),
			shift({ padding: 8 }),
			arrow({ element: arrowRef }),
		],
	});

	const hover = useHover(context);
	const click = useClick(context, {
		ignoreMouse: true,
	});

	const { getReferenceProps } = useInteractions([hover, click]);

	return (
		<>
			<div
				className="w-fit"
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
						className={`bg-brg-dark text-white px-2 py-1 rounded text-xs z-[52] ${className}`}
					>
						{content}

						<div
							ref={arrowRef}
							className={`absolute bg-brg-dark size-2 rotate-45 -z-10 ${className}`}
							style={{
								position: 'absolute',
								left: middlewareData.arrow?.x ?? '',
								top: middlewareData.arrow?.y ?? '',
								[context.placement.includes('top')
									? 'bottom'
									: 'top']: '-4px',
							}}
						/>
					</div>
				)}
			</FloatingPortal>
		</>
	);
};
