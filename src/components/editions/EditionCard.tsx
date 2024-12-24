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

import { Edition } from '../../types/Edition';
import { Link } from 'react-router-dom';
import { Credit } from '../Credit';
import { EditionStats } from './EditionStats';

type EditionCardProps = {
	edition: Edition;
};

export const EditionCard = ({ edition }: EditionCardProps) => {
	return (
		<Link
			to={`/registry?filter=edition:${encodeURIComponent(edition.name)}`}
			className="block bg-white hover:bg-brg-light/25 rounded-lg overflow-hidden border border-brg-light"
		>
			{edition.image && (
				<div className="aspect-video w-full overflow-hidden bg-brg-light relative">
					<img
						src={edition.image}
						alt={edition.name}
						className="w-full h-full object-cover"
						loading="lazy"
					/>

					{edition.imageCredit && (
						<div className="absolute bottom-4 right-4">
							<Credit
								car={edition.imageCredit.car}
								number={edition.imageCredit.number}
								owner={edition.imageCredit.owner}
								id={edition.imageCredit.id}
								direction="left"
							/>
						</div>
					)}
				</div>
			)}

			<div className="flex flex-col gap-4 p-4">
				<div className="flex flex-col">
					<p className="text-xs text-brg-mid">
						{edition.year} {edition.generation}
					</p>

					<h3 className="text-lg font-semibold text-brg">
						{edition.name}
					</h3>

					<p className="text-xs text-brg-mid">{edition.color}</p>
				</div>

				<EditionStats totalProduced={edition.totalProduced} />
			</div>
		</Link>
	);
};
