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
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Tooltip } from '../components/Tooltip';
import { EditionCard } from '../components/editions/EditionCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { TEdition } from '../types/Edition';

export const Editions = () => {
	const [editions, setEditions] = useState<TEdition[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	usePageTitle('Editions');

	useEffect(() => {
		const loadEditions = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/editions`
				);
				const editionsData = await response.json();

				setEditions(editionsData);
			} catch (error) {
				console.error('Error loading editions:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadEditions();
	}, []);

	return (
		<main className="flex-1 pt-20">
			<div className="container mx-auto py-8 flex flex-col gap-6">
				<h1 className="flex items-center gap-2 justify-between text-2xl font-bold">
					<span>Limited Edition Models</span>

					<Tooltip
						content={
							<>
								Production numbers may be inaccurate;
								<br />
								please contact us if you have information
							</>
						}
					>
						<svg
							className="size-6 text-brg-mid cursor-help"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</Tooltip>
				</h1>

				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{isLoading ? (
						<>
							{[...Array(4)].map((_, index) => (
								<div
									key={index}
									className="bg-brg-light rounded-lg h-80 animate-pulse"
								/>
							))}
						</>
					) : (
						<>
							{editions.map((edition) => (
								<EditionCard
									key={edition.id}
									edition={edition}
								/>
							))}
						</>
					)}
				</div>

				<div className="flex justify-between items-start">
					<div className="bg-brg-light flex flex-col items-start gap-3 p-8 text-sm rounded-lg w-1/3">
						<h3 className="flex gap-2 items-center text-brg-mid font-bold">
							<svg
								className="size-6 text-brg-mid cursor-help"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.15 15h-2.3v-2.3h2.3V17zM13 11.7v.8h-2v-1c0-.83.67-1.5 1.5-1.5.84 0 1.5-.67 1.5-1.5 0-.84-.67-1.5-1.5-1.5-.84 0-1.5.67-1.5 1.5H9c0-1.66 1.34-3 3-3s3 1.34 3 3c0 1.11-.61 2.08-1.5 2.6-.45.26-.5.44-.5.6z" />
							</svg>
							Are these ChatGPT photos?
						</h3>

						<p className="text-brg-mid md:w-4/5 lg:w-full">
							Yes, in order to avoid infringing on anyone's
							copyright, we use AI to generate photos for our
							editions. We'd love to have real photographs,
							though, so please contact us if you have a
							high-quality photo of your edition.
						</p>
					</div>

					<div className="bg-brg-light flex flex-col items-start gap-3 p-8 text-sm rounded-lg w-1/3">
						<h3 className="flex gap-2 items-center text-brg-mid font-bold">
							<svg
								className="size-6 text-brg-mid cursor-help"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clipRule="evenodd"
								/>
							</svg>
							Have a great photo of your edition?
						</h3>

						<p className="text-brg-mid md:w-4/5 lg:w-full">
							If you have a high-quality photo of your limited
							edition Miata, you can nominate it to be the
							featured image for the entire edition. Help make the
							registry more visually appealing for everyone.
						</p>

						<Link to="/about#contact">
							<Button
								variant="secondary"
								withArrow
								className="text-xs mt-2"
							>
								Get in touch
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</main>
	);
};
