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

import Symbol from '../assets/symbol.svg?react';

export function MobileWarning() {
	return (
		<div className="fixed inset-0 flex flex-col bg-brg-light">
			<div className="flex-1 px-10 pt-16 flex">
				<div className="w-full flex flex-col gap-4">
					<Symbol className="w-32 h-auto text-brg mb-6" />

					<div className="flex flex-col gap-3">
						<h1 className="text-2xl font-medium text-brg">
							Desktop Only
						</h1>

						<p className="text-lg text-brg-mid">
							The Miata Registry is currently only available on
							desktop devices.
						</p>

						<p className="text-lg text-brg-mid">
							Mobile support is coming soon.
						</p>
					</div>
				</div>
			</div>

			<div className="h-full mt-12 relative">
				<img
					src="https://store.miataregistry.com/app/car/1991SE182.jpg"
					alt="1991 British Racing Green #182"
					className="w-full h-full object-cover object-left"
				/>

				<svg
					className="absolute inset-0 w-full h-full pointer-events-none"
					preserveAspectRatio="none"
					viewBox="0 0 100 100"
				>
					<path d="M0 20 L100 0 L0 0 Z" fill="#E8EBEA" />
				</svg>
			</div>
		</div>
	);
}
