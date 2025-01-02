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

import { Link } from 'react-router-dom';
import { TEdition } from '../../types/Edition';
import { Credit } from '../Credit';
import { Stats } from './Stats';

type CardProps = {
	edition: TEdition;
};

export const Card = ({ edition }: CardProps) => {
	return (
		<div className="bg-white hover:bg-brg-light/25 rounded-lg overflow-hidden border border-brg-light cursor-pointer h-full flex flex-col">
			<div className="aspect-video w-full overflow-hidden bg-brg-light relative">
				<Link
					to={`/registry?filter=${encodeURIComponent(
						`edition:${edition.year} ${edition.name}`
					).replace(/%20/g, '+')}`}
				>
					<img
						src={`https://store.miataregistry.com/${edition.image_car_id ? `car/${edition.image_car_id}` : `edition/${edition.id}`}.jpg`}
						alt={edition.name}
						className="w-full h-full object-cover"
					/>
				</Link>

				{edition.image_car_id && (
					<div className="absolute bottom-4 right-4">
						<Credit id={edition.image_car_id} direction="left" />
					</div>
				)}
			</div>

			<Link
				to={`/registry?filter=${encodeURIComponent(
					`edition:${edition.year} ${edition.name}`
				).replace(/%20/g, '+')}`}
				className="flex flex-col gap-4 p-4 flex-1"
			>
				<div className="flex flex-col">
					<p className="text-xs text-brg-mid">
						{edition.year} {edition.generation}
					</p>

					<h3 className="text-lg font-semibold text-brg">
						{edition.name}
					</h3>

					<p className="text-xs text-brg-mid">{edition.color}</p>
				</div>

				<Stats edition={edition} />
			</Link>
		</div>
	);
};
