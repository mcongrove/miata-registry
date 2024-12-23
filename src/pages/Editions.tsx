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

import { EditionCard } from '../components/editions/EditionCard';
import sampleEditions from '../data/sampleEditions.json';

export const Editions = () => {
	const getRandomStats = (totalProduced: number) => {
		const totalInRegistry = Math.floor(
			Math.random() * (totalProduced * 0.8)
		); // Up to 80% in registry
		const totalClaimed = Math.floor(Math.random() * totalInRegistry); // Up to 100% of registry claimed
		return { totalInRegistry, totalClaimed };
	};

	return (
		<main className="flex-1 pt-20">
			<div className="container mx-auto py-8">
				<h1 className="text-2xl font-bold mb-6">
					Limited Edition Models
				</h1>

				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{sampleEditions.map((edition) => (
						<EditionCard
							key={edition.id}
							edition={edition}
							stats={getRandomStats(edition.totalProduced || 0)}
						/>
					))}
				</div>
			</div>
		</main>
	);
};
