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

import { RarityLevels } from '../components/rarity/RarityLevels';
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
			<div className="container mx-auto flex flex-col gap-8 lg:gap-0 lg:flex-row">
				<div className="flex flex-col gap-8 lg:gap-16 z-10 lg:w-1/2">
					<div className="flex flex-col gap-4">
						<div className="w-fit flex gap-1.5 items-center bg-amber-100 border border-amber-300 text-amber-700 text-xs py-2 px-4 rounded-full">
							<i className="fa-regular fa-clock text-sm"></i>{' '}
							Coming Soon
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

						<p className="text-md text-brg-mid">
							We consider factory performance upgrades, numbered
							editions, and unique color combinations. Original
							documentation and preservation state play important
							roles—from window stickers to mileage, every detail
							contributes to understanding a car's historical
							value. Cars from the first year of each generation
							receive special recognition, as do those with
							documented low mileage and original components.
						</p>

						<p className="text-md text-brg-mid">
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

				<div className="flex items-center justify-center lg:w-1/2">
					<div className="relative w-full lg:w-[544px] h-[544px]">
						<img
							src="https://store.miataregistry.com/app/car/about-5.jpg"
							className="absolute max-lg:left-1/4 top-0 size-48 lg:right-60 lg:top-0 lg:size-64 rounded-lg object-cover object-left shadow-xl bg-brg-light rotate-6 hover:-translate-y-3 hover:translate-x-2 transition-all duration-500 ease-out"
							alt="Miata in a valley"
						/>

						<img
							src="https://store.miataregistry.com/app/car/about-6.jpg"
							className="absolute right-0 top-24 size-40 lg:right-0 lg:top-24 lg:size-72 rounded-lg object-cover object-bottom shadow-xl bg-brg-light -rotate-3 hover:-translate-y-3 hover:-translate-x-2 transition-all duration-500 ease-out"
							alt="Miata in a field at dusk"
						/>

						<img
							src="https://store.miataregistry.com/app/car/about-7.jpg"
							className="absolute top-44 left-0 w-64 h-48 lg:right-40 lg:top-72 lg:w-96 lg:h-64 rounded-lg object-cover shadow-xl bg-brg-light rotate-3 hover:-translate-y-3 hover:translate-x-2 transition-all duration-500 ease-out"
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

					<RarityLevels />
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-2xl font-semibold text-brg">
						Edition Base Scores
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						<ScoreCard
							title="Production Score"
							rows={productionScore}
						/>

						<ScoreCard
							title="Characteristics Modifiers"
							rows={characteristicsModifiers}
						/>

						<ScoreCard title="Age Modifiers" rows={ageModifiers} />
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-2xl font-semibold text-brg">
						Car-Specific Scores
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						<ScoreCard
							title="Mileage Modifiers"
							rows={mileageModifiers}
						/>

						<ScoreCard
							title={
								<span className="flex justify-between items-center">
									Preservation State
									<span className="text-[10px] tracking-wider uppercase text-brg-mid/70 font-medium">
										in good condition
									</span>
								</span>
							}
							rows={preservationModifiers}
						/>

						<ScoreCard
							title="Documentation Bonuses"
							rows={documentationScores}
						/>
					</div>
				</div>
			</div>
		</main>
	);
};
