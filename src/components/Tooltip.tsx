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
	FloatingPortal,
	offset,
	Placement,
	useFloating,
	useHover,
	useInteractions,
} from '@floating-ui/react';
import { useRef, useState } from 'react';

type TooltipProps = {
	children: React.ReactNode;
	content: React.ReactNode;
	placement?: Placement;
};

export const Tooltip = ({
	children,
	content,
	placement = 'top',
}: TooltipProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const arrowRef = useRef(null);

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement,
		middleware: [offset(8), arrow({ element: arrowRef })],
	});

	const hover = useHover(context);
	const { getReferenceProps } = useInteractions([hover]);

	return (
		<>
			<div ref={refs.setReference} {...getReferenceProps()}>
				{children}
			</div>

			<FloatingPortal>
				{isOpen && (
					<div
						ref={refs.setFloating}
						style={floatingStyles}
						className="bg-brg-dark text-white px-2 py-1 rounded text-xs"
					>
						{content}

						<div
							ref={arrowRef}
							className="absolute bg-brg-dark size-2 rotate-45 -z-10"
							style={{
								bottom: '-4px',
								left: '50%',
								transform: 'translateX(-50%)',
								clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
							}}
						/>
					</div>
				)}
			</FloatingPortal>
		</>
	);
};
