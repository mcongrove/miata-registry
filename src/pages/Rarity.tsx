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

import { Levels } from '../components/rarity/Levels';
import { ScoreCard } from '../components/rarity/ScoreCard';
import { usePageMeta } from '../hooks/usePageMeta';

export const Rarity = () => {
	const productionScore = [
		{ condition: 'Fewer than 100 units', points: '50 points' },
		{ condition: 'Up to 500 units', points: '40 points' },
		{ condition: 'Up to 1,000 units', points: '30 points' },
		{ condition: 'Up to 2,500 units', points: '20 points' },
		{ condition: 'Up to 5,000 units', points: '10 points' },
		{ condition: 'Above 5,000 units', points: '0 points' },
	];

	const preservationModifiers = [
		{ condition: 'Original paint', points: '+5 points' },
		{ condition: 'Original hard top', points: '+4 points' },
		{ condition: 'Original soft top', points: '+3 points' },
		{ condition: 'Original wheels', points: '+3 points' },
		{ condition: 'Single owner', points: '+3 points' },
	];

	const ageModifiers = [
		{ condition: 'Years since release', points: '+1 point' },
		{ condition: 'First year of generation', points: '+5 points' },
	];

	const characteristicsModifiers = [
		{ condition: 'Factory performance modifications', points: '+5 points' },
		{ condition: 'Numbered edition', points: '+5 points' },
		{ condition: 'Unique exterior color', points: '+3 points' },
		{ condition: 'Unique interior color', points: '+2 points' },
	];

	const documentationScores = [
		{ condition: 'Original window sticker', points: '+2 points' },
		{ condition: 'Original sales documents', points: '+2 points' },
		{ condition: 'Complete service records', points: '+2 points' },
	];

	const mileageModifiers = [
		{ condition: 'Under 1,000 miles', points: '+15 points' },
		{ condition: 'Under 5,000 miles', points: '+10 points' },
		{ condition: 'Under 25,000 miles', points: '+5 points' },
		{ condition: 'Under 50,000 miles', points: '+2 points' },
		{ condition: 'Over 50,000 miles', points: '0 points' },
	];

	usePageMeta({
		path: '/rarity',
		title: 'Rarity Scores',
		description:
			'How we calculate rarity scores for all Miata Registry cars.',
	});

	return (
		<main className="flex-1 px-8 pt-28 lg:pt-40 lg:px-0 pb-16 flex flex-col gap-20">
			<div className="container mx-auto flex flex-col gap-12 lg:gap-0 lg:flex-row">
				<div className="relative z-10 flex flex-col gap-8 lg:w-1/2 lg:bg-white lg:pr-6">
					<div className="flex flex-col gap-4">
						<div className="w-fit flex gap-1.5 items-center bg-amber-100 border border-amber-300 text-amber-700 text-xs py-2 px-4 rounded-full">
							<i className="fa-regular fa-clock text-sm"></i> Work
							in Progress
						</div>

						<h1 className="text-4xl lg:text-6xl font-medium text-brg">
							Rarity Scores
						</h1>

						<p className="text-md lg:text-xl text-brg-mid">
							The Miata Registry's rarity score evaluates each car
							through a combination of production numbers, unique
							characteristics, age, special features, and
							historical significance. Each car's score reflects
							its place in Miata history, taking into account both
							its original specifications and how well it has been
							preserved over time.
						</p>

						<p className="text-sm lg:text-md text-brg-mid">
							We consider factory performance upgrades, numbered
							editions, and unique color combinations. Original
							documentation and preservation state play important
							roles—from window stickers to mileage, every detail
							contributes to understanding a car's historical
							value. Cars from the first year of each generation
							receive special recognition, as do those with
							documented low mileage and original components.
						</p>

						<p className="text-sm lg:text-md text-brg-mid">
							This scoring system helps enthusiasts understand
							where their vehicles sit in the spectrum of Miata
							rarity, from limited production runs to truly
							historic examples. It's our way of celebrating what
							makes each car special while providing a consistent
							framework for evaluating the unique attributes that
							set certain cars apart.
						</p>
					</div>
				</div>

				<div className="flex w-full shrink-0 items-center justify-center overflow-visible lg:w-1/2">
					<div className="relative mx-auto h-[30rem] w-full max-w-[22rem] overflow-visible sm:max-w-md lg:h-[34rem] lg:w-[34rem] lg:max-w-none">
						<img
							src="https://store.miataregistry.com/app/car/about-5.jpg"
							className="absolute left-[10%] top-2 z-20 size-48 rotate-6 rounded-lg bg-brg-light object-cover object-left shadow-xl transition-all duration-500 ease-out hover:-translate-y-3 hover:translate-x-2 lg:left-auto lg:right-52 lg:top-4 lg:size-64"
							alt="Miata in a valley"
						/>

						<img
							src="https://store.miataregistry.com/app/car/about-6.jpg"
							className="absolute right-0 top-28 z-30 size-44 -rotate-3 rounded-lg bg-brg-light object-cover object-bottom shadow-xl transition-all duration-500 ease-out hover:-translate-y-3 hover:-translate-x-2 lg:top-24 lg:size-72"
							alt="Miata in a field at dusk"
						/>

						<img
							src="https://store.miataregistry.com/app/car/about-7.jpg"
							className="absolute bottom-2 left-0 z-10 h-52 w-64 rotate-3 rounded-lg bg-brg-light object-cover shadow-xl transition-all duration-500 ease-out hover:-translate-y-3 hover:translate-x-2 lg:bottom-auto lg:left-auto lg:right-32 lg:top-[17rem] lg:h-64 lg:w-96"
							alt="A group of Miatas in a field"
						/>
					</div>
				</div>
			</div>

			<div className="container mx-auto flex flex-col gap-10">
				<div className="flex flex-col gap-6">
					<h2 className="text-3xl font-medium text-center">
						Classifications
					</h2>

					<Levels />
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-center lg:text-left text-2xl font-semibold text-brg">
						Edition Base Scores
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
						<ScoreCard title="Production" rows={productionScore} />

						<ScoreCard
							title="Characteristics"
							rows={characteristicsModifiers}
						/>

						<ScoreCard title="Age" rows={ageModifiers} />
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-center lg:text-left text-2xl font-semibold text-brg">
						Car-Specific Scores
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
						<ScoreCard title="Mileage" rows={mileageModifiers} />

						<ScoreCard
							title={
								<>
									Preservation
									<span className="mt-1 block text-xs font-normal text-brg-mid/70">
										Good condition, car older than 10 years
									</span>
								</>
							}
							rows={preservationModifiers}
						/>

						<ScoreCard
							title={
								<>
									Documentation
									<span className="mt-1 block text-xs font-normal text-brg-mid/70">
										Car older than 10 years
									</span>
								</>
							}
							rows={documentationScores}
						/>
					</div>
				</div>
			</div>
		</main>
	);
};
