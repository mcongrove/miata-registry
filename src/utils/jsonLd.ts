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

import { TEdition } from '../types/Edition';
import { TNewsArticle } from '../types/News';
import { TResource } from '../types/Resource';
import { formatEditionColor, hasSequence } from './car';
import { editionPath, editionSlug } from './editionSlug';
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

type CarJsonLdInput = {
	id: string;
	sequence?: number | null;
	edition?: {
		year: number;
		name: string;
		description?: string | null;
	} | null;
};

export function carPageJsonLd(car: CarJsonLdInput) {
	const edition = car.edition;
	const sequenceSuffix =
		edition && hasSequence(car.sequence) ? ` #${car.sequence}` : '';
	const name = edition
		? `${edition.year} ${edition.name}${sequenceSuffix}`
		: 'Mazda Miata';
	const url = `${SITE_ORIGIN}/registry/${car.id}`;
	const description = edition?.description?.split('\n')[0];
	const editionUrl = edition
		? `${SITE_ORIGIN}${editionPath(edition.year, edition.name)}`
		: undefined;

	return {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name,
		url,
		...(description ? { description } : {}),
		isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
		about: {
			'@type': 'Thing',
			name,
			url,
			...(editionUrl
				? {
						isPartOf: {
							'@type': 'CollectionPage',
							url: editionUrl,
							name: `${edition!.year} ${edition!.name}`,
						},
					}
				: {}),
		},
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

export function resourcePageJsonLd(resource: TResource) {
	const url = `${SITE_ORIGIN}/resources/${resource.id}`;
	const base = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: resource.title,
		description: resource.summary,
		datePublished: resource.publish_date,
		url,
		isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
		...(resource.kind === 'link' || resource.kind === 'registry'
			? {
					about: {
						'@type': 'WebPage',
						name: resource.title,
						description:
							'Third-party resource cataloged by the Miata Registry; not operated by the Miata Registry.',
					},
				}
			: {}),
	};

	// Describe hosted files without contentUrl so crawlers are not handed a download URL.
	if (
		resource.file_name ||
		resource.file_mime ||
		resource.file_bytes != null
	) {
		return {
			...base,
			mainEntity: {
				'@type': 'DataDownload',
				name: resource.file_name || resource.title,
				encodingFormat: resource.file_mime || undefined,
				contentSize:
					resource.file_bytes != null
						? String(resource.file_bytes)
						: undefined,
			},
		};
	}

	return base;
}

type EditionJsonLdCar = {
	id: string;
	sequence?: number | null;
};

export function editionPageJsonLd(
	edition: TEdition,
	cars: EditionJsonLdCar[] = []
) {
	const name = `${edition.year} ${edition.name}`;
	const path = editionPath(edition.year, edition.name);
	const url = `${SITE_ORIGIN}${path}`;
	const description =
		edition.description?.split('\n')[0] ||
		`${name} limited edition Mazda Miata documented in the Miata Registry.`;
	const produced =
		edition.total_produced != null
			? edition.total_produced.toLocaleString('en-US')
			: null;
	const inRegistry = (edition.in_registry ?? 0).toLocaleString('en-US');
	const claimed = (edition.claimed ?? 0).toLocaleString('en-US');

	const faqEntities = [
		produced
			? {
					'@type': 'Question',
					name: `How many ${name} Miatas were produced?`,
					acceptedAnswer: {
						'@type': 'Answer',
						text: `${produced} ${name} Miatas were produced.`,
					},
				}
			: null,
		{
			'@type': 'Question',
			name: `How many ${name} Miatas are in the Miata Registry?`,
			acceptedAnswer: {
				'@type': 'Answer',
				text: `${inRegistry} are in the registry; ${claimed} are claimed by owners.`,
			},
		},
		{
			'@type': 'Question',
			name: `What color is the ${name} Miata?`,
			acceptedAnswer: {
				'@type': 'Answer',
				text:
					edition.color.toLowerCase() === 'various'
						? `The ${name} was offered in multiple factory colors.`
						: `The ${name} was finished in ${formatEditionColor(edition.color)}.`,
			},
		},
	].filter(Boolean);

	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'CollectionPage',
				'@id': `${url}#webpage`,
				name,
				url,
				description,
				isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
				about: {
					'@type': 'Product',
					name,
					brand: { '@type': 'Brand', name: 'Mazda' },
					category: 'Limited edition Mazda Miata',
					...(produced
						? {
								additionalProperty: [
									{
										'@type': 'PropertyValue',
										name: 'Total produced',
										value: edition.total_produced,
									},
									{
										'@type': 'PropertyValue',
										name: 'In registry',
										value: edition.in_registry ?? 0,
									},
									{
										'@type': 'PropertyValue',
										name: 'Claimed',
										value: edition.claimed ?? 0,
									},
									{
										'@type': 'PropertyValue',
										name: 'Generation',
										value: edition.generation,
									},
									{
										'@type': 'PropertyValue',
										name: 'Color',
										value: formatEditionColor(
											edition.color
										),
									},
								],
							}
						: {}),
					image: `https://store.miataregistry.com/edition/${edition.id}.jpg`,
				},
				...(cars.length > 0
					? {
							mainEntity: {
								'@type': 'ItemList',
								numberOfItems: cars.length,
								itemListElement: cars.map((car, index) => ({
									'@type': 'ListItem',
									position: index + 1,
									url: `${SITE_ORIGIN}/registry/${car.id}`,
									name: hasSequence(car.sequence)
										? `${name} #${car.sequence}`
										: name,
								})),
							},
						}
					: {}),
			},
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						name: 'Editions',
						item: `${SITE_ORIGIN}/registry/editions`,
					},
					{
						'@type': 'ListItem',
						position: 2,
						name,
						item: url,
					},
				],
			},
			{
				'@type': 'FAQPage',
				mainEntity: faqEntities,
			},
			{
				'@type': 'WebPage',
				url,
				name,
				description,
				identifier: editionSlug(edition.year, edition.name),
			},
		],
	};
}
