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

import { TCar } from '../types/Car';
import { TNewsArticle } from '../types/News';
import { hasSequence } from './car';

const SITE_ORIGIN = 'https://miataregistry.com';

export function organizationWebSite() {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Organization',
				'@id': `${SITE_ORIGIN}/#organization`,
				name: 'Miata Registry',
				url: SITE_ORIGIN,
				logo: 'https://store.miataregistry.com/app/open-graph.jpg',
			},
			{
				'@type': 'WebSite',
				'@id': `${SITE_ORIGIN}/#website`,
				name: 'Miata Registry',
				url: SITE_ORIGIN,
				publisher: { '@id': `${SITE_ORIGIN}/#organization` },
				potentialAction: {
					'@type': 'SearchAction',
					target: {
						'@type': 'EntryPoint',
						urlTemplate: `${SITE_ORIGIN}/registry?filter={search_term_string}`,
					},
					'query-input': 'required name=search_term_string',
				},
			},
		],
	};
}

export function vehicleJsonLd(car: TCar) {
	const edition = car.edition;
	const sequenceSuffix =
		edition && hasSequence(car.sequence) ? ` #${car.sequence}` : '';

	return {
		'@context': 'https://schema.org',
		'@type': 'Vehicle',
		name: edition
			? `${edition.year} ${edition.name}${sequenceSuffix}`
			: 'Mazda Miata',
		model: edition?.name,
		productionDate: car.manufacture_date || String(edition?.year ?? ''),
		color: edition?.color,
		url: `${SITE_ORIGIN}/registry/${car.id}`,
	};
}

export function newsArticleJsonLd(article: TNewsArticle) {
	return {
		'@context': 'https://schema.org',
		'@type': 'NewsArticle',
		headline: article.title,
		datePublished: article.publish_date,
		author: {
			'@type': 'Organization',
			name: 'Miata Registry',
		},
		url: `${SITE_ORIGIN}/news/${article.id}`,
	};
}
