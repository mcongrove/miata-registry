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
import { Icon } from '../components/Icon';
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

	const editionsByGeneration = editions.reduce(
		(acc, edition) => {
			const gen = edition.generation.toUpperCase();
			if (!acc[gen]) acc[gen] = [];
			acc[gen].push(edition);
			return acc;
		},
		{} as Record<string, TEdition[]>
	);

	return (
		<main className="flex-1 pt-20">
			<div className="container mx-auto p-8 lg:p-0 lg:py-8">
				<h1 className="flex items-center gap-2 justify-between text-2xl lg:text-3xl font-bold mb-4 lg:mb-8">
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
						<Icon name="info-circle" className="cursor-help" />
					</Tooltip>
				</h1>

				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{[...Array(4)].map((_, index) => (
							<div
								key={index}
								className="bg-brg-light rounded-lg h-80 animate-pulse"
							/>
						))}
					</div>
				) : (
					<div className="flex flex-col gap-8 lg:gap-12">
						{['NA', 'NB', 'NC', 'ND'].map((generation) => {
							const yearRanges = {
								NA: '1989 – 1997',
								NB: '1999 – 2005',
								NC: '2006 – 2015',
								ND: '2016 – Present',
							};

							return (
								editionsByGeneration[generation]?.length >
									0 && (
									<section
										key={generation}
										className="flex flex-col gap-6 lg:gap-6"
									>
										<h2 className="text-xl lg:text-2xl font-bold text-brg-dark">
											{generation} Generation{' '}
											<span className="text-brg-border font-normal">
												{
													yearRanges[
														generation as keyof typeof yearRanges
													]
												}
											</span>
										</h2>

										<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
											{editionsByGeneration[
												generation
											]?.map((edition) => (
												<EditionCard
													key={edition.id}
													edition={edition}
												/>
											))}
										</div>
									</section>
								)
							);
						})}
					</div>
				)}

				<div className="flex justify-between items-start mt-16 gap-12">
					<div className="bg-brg-light flex flex-col items-start gap-3 p-8 text-sm rounded-lg w-1/2">
						<h3 className="flex gap-2 items-center text-brg-mid font-bold">
							<Icon name="question-circle" />
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

					<div className="bg-brg-light flex flex-col items-start gap-3 p-8 text-sm rounded-lg w-1/2">
						<h3 className="flex gap-2 items-center text-brg-mid font-bold">
							<Icon name="info-circle" />
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
