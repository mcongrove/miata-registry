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

import { twMerge } from 'tailwind-merge';
import { useModal } from '../context/ModalContext';
import { Button } from './Button';

type RegisterCtaProps = {
	title?: string;
	description?: string;
	buttonLabel?: string;
	dataCy?: string;
	className?: string;
};

export function RegisterCta({
	title = 'Register your limited edition Miata',
	description = 'Help preserve Miata history by registering your limited edition model. Every registration adds to our collective knowledge and helps document these special cars for future generations.',
	buttonLabel = 'Claim your Miata',
	dataCy,
	className,
}: RegisterCtaProps) {
	const { openModal } = useModal();

	return (
		<div className={twMerge('bg-brg-light', className)}>
			<div className="flex flex-row items-stretch">
				<div className="relative hidden w-1/3 overflow-hidden lg:block">
					<img
						src="https://store.miataregistry.com/app/car/about-4.jpg"
						className="absolute inset-0 h-full w-full scale-110 object-cover object-bottom"
						alt="Red Miata parked by the water"
					/>

					<svg
						className="pointer-events-none absolute inset-0 h-full w-[calc(100%_-_1px)]"
						preserveAspectRatio="none"
						viewBox="0 0 100 100"
					>
						<path d="M93 0 L100 100 L100 0 Z" fill="#E8EBEA" />
					</svg>
				</div>

				<div className="z-10 -ml-px bg-brg-light p-8 lg:w-2/3 lg:p-12">
					<h2 className="mb-4 text-xl font-bold text-brg lg:text-4xl">
						{title}
					</h2>

					<p className="mb-6 text-brg-mid lg:mb-8 lg:text-lg">
						{description}
					</p>

					<Button
						withArrow
						onClick={() => openModal('register')}
						data-cy={dataCy}
					>
						{buttonLabel}
					</Button>
				</div>
			</div>
		</div>
	);
}
