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

import { formatEditionColor } from '../utils/car';
import { editionPath } from '../utils/editionSlug';
import { carPageJsonLd, editionPageJsonLd } from '../utils/jsonLd';
import { BASE_URL, DEFAULT_DESCRIPTION } from './constants';

export type PageMeta = {
	title: string;
	description: string;
	path: string;
	noindex?: boolean;
	botContent?: string;
};

const escapeHtml = (value: string): string =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

const formatTitle = (title: string): string =>
	title.includes('Miata Registry') ? title : `${title} – Miata Registry`;

export const buildCanonicalUrl = (path: string): string =>
	`${BASE_URL}${path.replace(/\/$/, '') || ''}`;

const replaceMetaContent = (
	html: string,
	selector: RegExp,
	replacement: string
): string => {
	if (selector.test(html)) {
		return html.replace(selector, replacement);
	}

	return html;
};

export const injectPageMeta = (html: string, meta: PageMeta): string => {
	const title = formatTitle(meta.title);
	const description = meta.description || DEFAULT_DESCRIPTION;
	const canonical = buildCanonicalUrl(meta.path);
	const robots = meta.noindex ? 'noindex, follow' : 'index, follow';

	let result = html;

	result = result.replace(
		/<title>[^<]*<\/title>/,
		`<title>${escapeHtml(title)}</title>`
	);
	result = replaceMetaContent(
		result,
		/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
		`<meta name="description" content="${escapeHtml(description)}" />`
	);
	result = replaceMetaContent(
		result,
		/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
		`<meta property="og:title" content="${escapeHtml(title)}" />`
	);
	result = replaceMetaContent(
		result,
		/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
		`<meta property="og:description" content="${escapeHtml(description)}" />`
	);
	result = replaceMetaContent(
		result,
		/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
		`<meta property="og:url" content="${escapeHtml(canonical)}" />`
	);
	result = replaceMetaContent(
		result,
		/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
		`<meta name="twitter:title" content="${escapeHtml(title)}" />`
	);
	result = replaceMetaContent(
		result,
		/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
		`<meta name="twitter:description" content="${escapeHtml(description)}" />`
	);
	result = replaceMetaContent(
		result,
		/<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/,
		`<meta name="twitter:url" content="${escapeHtml(canonical)}" />`
	);
	result = replaceMetaContent(
		result,
		/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
		`<link rel="canonical" href="${escapeHtml(canonical)}" />`
	);
	result = replaceMetaContent(
		result,
		/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/,
		`<meta name="robots" content="${robots}" />`
	);

	if (meta.botContent) {
		result = result.replace('</body>', `${meta.botContent}\n\t</body>`);
	}

	return result;
};

export const buildBotArticle = (content: string): string =>
	`<article id="bot-content">${content}</article>`;

const buildBotHeading = (heading: string): string =>
	`<h1>${escapeHtml(heading)}</h1>`;

export const buildStaticBotContent = (heading: string, body = ''): string =>
	buildBotArticle(`${buildBotHeading(heading)}${body}`);

export type CarBotData = {
	id: string;
	sequence?: number | null;
	story?: string | null;
	current_owner_id?: string | null;
	edition?: {
		year: number;
		name: string;
		color: string;
		total_produced?: number | null;
		description?: string | null;
	};
};

const hasSequence = (sequence?: number | null): boolean =>
	sequence != null && sequence !== 0;

export const buildCarBotContent = (car: CarBotData): string => {
	const edition = car.edition;
	const year = edition?.year ?? '';
	const name = edition?.name ?? 'Unknown edition';
	const editionLabel = `${year} ${name}`.trim();
	const sequenceSuffix = hasSequence(car.sequence) ? ` #${car.sequence}` : '';
	const colorLabel = edition?.color
		? `${formatEditionColor(edition.color)}.`
		: '';
	const produced =
		edition?.total_produced != null
			? ` 1 of ${edition.total_produced.toLocaleString('en-US')} produced.`
			: '';
	const claimed = car.current_owner_id ? ' Claimed.' : ' Unclaimed.';

	const summary = `${editionLabel}${sequenceSuffix}. ${colorLabel}${produced}${claimed}`;

	const editionHref =
		edition != null
			? `${BASE_URL}${editionPath(edition.year, edition.name)}`
			: null;

	const parts = [
		editionHref
			? `<h1><a href="${escapeHtml(editionHref)}">${escapeHtml(editionLabel)}</a>${escapeHtml(sequenceSuffix)}</h1>`
			: `<h1>${escapeHtml(editionLabel)}</h1>`,
		`<p>${escapeHtml(summary.trim())}</p>`,
	];

	if (editionHref) {
		parts.push(
			`<p>Edition page: <a href="${escapeHtml(editionHref)}">${escapeHtml(editionLabel)}</a></p>`
		);
	}

	if (edition?.description) {
		parts.push(`<p>${escapeHtml(edition.description.split('\n')[0])}</p>`);
	}

	if (car.story?.trim()) {
		parts.push(`<p>${escapeHtml(car.story.trim())}</p>`);
	}

	const jsonLd = carPageJsonLd({
		id: car.id,
		sequence: car.sequence,
		edition: edition
			? {
					year: edition.year,
					name: edition.name,
					description: edition.description,
				}
			: null,
	});

	return `${buildBotArticle(parts.join('\n'))}\n<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
};

export const buildCarPageMeta = (
	car: CarBotData,
	indexable: boolean
): PageMeta => {
	const edition = car.edition;
	const title = edition
		? `${edition.year} ${edition.name}${hasSequence(car.sequence) ? ` #${car.sequence}` : ''}`
		: 'Car';
	const description =
		edition?.description?.split('\n')[0] || DEFAULT_DESCRIPTION;

	return {
		title,
		description,
		path: `/registry/${car.id}`,
		noindex: !indexable,
		botContent: buildCarBotContent(car),
	};
};

export type EditionRow = {
	year: number;
	name: string;
	generation: string;
	color: string;
	total_produced: number | null;
	in_registry: number;
	claimed: number;
	slug?: string;
};

export type EditionBotData = {
	id: string;
	year: number;
	name: string;
	generation: string;
	color: string;
	description?: string | null;
	total_produced?: number | null;
	in_registry?: number;
	claimed?: number;
	rarity_score?: number | null;
	cars?: Array<{ id: string; sequence?: number | null }>;
};

export const buildEditionsBotContent = (editions: EditionRow[]): string => {
	const rows = editions
		.map((edition) => {
			const path = editionPath(edition.year, edition.name);
			const href = `${BASE_URL}${path}`;

			return `<tr><td>${edition.year}</td><td><a href="${escapeHtml(href)}">${escapeHtml(edition.name)}</a></td><td>${escapeHtml(edition.generation)}</td><td>${escapeHtml(edition.color)}</td><td>${edition.total_produced?.toLocaleString('en-US') ?? '—'}</td><td>${edition.in_registry}</td><td>${edition.claimed}</td></tr>`;
		})
		.join('\n');

	return buildBotArticle(
		`${buildBotHeading('Limited Editions')}<p>Index of limited edition Mazda Miatas tracked by the Miata Registry. Each name links to a dedicated edition page.</p><table><thead><tr><th>Year</th><th>Name</th><th>Generation</th><th>Color</th><th>Produced</th><th>In registry</th><th>Claimed</th></tr></thead><tbody>${rows}</tbody></table>`
	);
};

export const buildEditionBotContent = (edition: EditionBotData): string => {
	const title = `${edition.year} ${edition.name}`;
	const produced =
		edition.total_produced != null
			? `${edition.total_produced.toLocaleString('en-US')} produced.`
			: '';
	const registryStats = `${(edition.in_registry ?? 0).toLocaleString('en-US')} in the registry; ${(edition.claimed ?? 0).toLocaleString('en-US')} claimed.`;
	const colorLabel = formatEditionColor(edition.color);
	const colorSentence =
		edition.color.toLowerCase() === 'various'
			? `${title} is a ${edition.generation} generation limited edition Mazda Miata offered in multiple factory colors.`
			: `${title} is a ${edition.generation} generation limited edition Mazda Miata in ${colorLabel}.`;
	const summary = `${colorSentence} ${produced} ${registryStats}`.trim();

	const parts = [
		`<h1>${escapeHtml(title)}</h1>`,
		`<p>${escapeHtml(summary)}</p>`,
	];

	if (edition.description?.trim()) {
		for (const paragraph of edition.description.split('\n')) {
			const trimmed = paragraph.trim();

			if (trimmed) {
				parts.push(`<p>${escapeHtml(trimmed)}</p>`);
			}
		}
	}

	const colorFaq =
		edition.color.toLowerCase() === 'various'
			? 'Multiple factory colors.'
			: `${colorLabel}.`;

	parts.push(
		'<h2>Frequently asked questions</h2>',
		`<p><strong>How many ${escapeHtml(title)} Miatas were produced?</strong> ${
			edition.total_produced != null
				? `${edition.total_produced.toLocaleString('en-US')}.`
				: 'Production total is not confirmed in the registry.'
		}</p>`,
		`<p><strong>How many are in the Miata Registry?</strong> ${(edition.in_registry ?? 0).toLocaleString('en-US')} cars; ${(edition.claimed ?? 0).toLocaleString('en-US')} claimed by owners.</p>`,
		`<p><strong>What color is the ${escapeHtml(title)}?</strong> ${escapeHtml(colorFaq)}</p>`
	);

	if (edition.cars && edition.cars.length > 0) {
		const items = edition.cars
			.map((car) => {
				const label =
					car.sequence != null && car.sequence !== 0
						? `${title} #${car.sequence}`
						: title;

				return `<li><a href="${BASE_URL}/registry/${escapeHtml(car.id)}">${escapeHtml(label)}</a></li>`;
			})
			.join('\n');

		parts.push('<h2>Example cars</h2>', `<ul>${items}</ul>`);
	}

	const jsonLd = editionPageJsonLd(
		{
			id: edition.id,
			year: edition.year,
			name: edition.name,
			generation: edition.generation,
			color: edition.color,
			description: edition.description ?? undefined,
			total_produced: edition.total_produced ?? undefined,
			in_registry: edition.in_registry,
			claimed: edition.claimed,
			rarity_score: edition.rarity_score ?? undefined,
		},
		edition.cars ?? []
	);

	return `${buildBotArticle(parts.join('\n'))}\n<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
};

export const buildEditionPageMeta = (edition: EditionBotData): PageMeta => {
	const title = `${edition.year} ${edition.name}`;
	const description =
		edition.description?.split('\n')[0] ||
		`${title} — limited edition Mazda Miata. ${
			edition.total_produced != null
				? `${edition.total_produced.toLocaleString('en-US')} produced;`
				: ''
		} ${(edition.in_registry ?? 0).toLocaleString('en-US')} in the Miata Registry.`;

	return {
		title,
		description,
		path: editionPath(edition.year, edition.name),
		botContent: buildEditionBotContent(edition),
	};
};

export const buildRarityBotContent = (): string =>
	buildBotArticle(
		`${buildBotHeading('Rarity Scores')}<p>Miata Registry rarity scores combine production volume, preservation, age, characteristics, documentation, and mileage modifiers into a 0–100 score.</p>
<p>Production volume contributes up to 50 points (fewer than 100 units = 50 points). Preservation modifiers add points for original paint, tops, wheels, and single ownership. Age adds points per year since release. Factory performance mods, numbered editions, and unique colors add more. Documentation and low mileage provide additional bonuses.</p>`
	);

export type SiteStats = {
	cars: number;
	claimedCars: number;
	editions: number;
	countries: number;
};

export const buildAboutBotContent = (stats: SiteStats): string =>
	buildBotArticle(
		`${buildBotHeading('About the Miata Registry')}<p>Miata Registry is a community-driven project documenting limited edition Mazda Miatas.</p>
<ul>
<li>${stats.cars.toLocaleString('en-US')} cars in the registry</li>
<li>${stats.claimedCars.toLocaleString('en-US')} claimed cars</li>
<li>${stats.editions} limited editions</li>
<li>${stats.countries} countries represented</li>
</ul>`
	);

export type NewsBotData = {
	id: string;
	title: string;
	body: string;
	publish_date: string;
};

export const buildNewsBotContent = (article: NewsBotData): string => {
	const excerpt = article.body.split('\n')[0];

	return buildBotArticle(
		`<h1>${escapeHtml(article.title)}</h1>
<p><time datetime="${escapeHtml(article.publish_date)}">${escapeHtml(article.publish_date)}</time></p>
<p>${escapeHtml(excerpt)}</p>`
	);
};

export const buildNewsPageMeta = (article: NewsBotData): PageMeta => ({
	title: article.title,
	description: `${article.body.split('\n')[0]}...`,
	path: `/news/${article.id}`,
	botContent: buildNewsBotContent(article),
});

export type ResourceBotData = {
	id: string;
	title: string;
	summary: string;
	body?: string | null;
	kind: string;
	href?: string | null;
	publish_date: string;
};

export const buildResourceBotContent = (resource: ResourceBotData): string => {
	const body =
		resource.body?.split('\n').filter(Boolean)[0] || resource.summary;
	const isThirdParty =
		(resource.kind === 'link' || resource.kind === 'registry') &&
		Boolean(resource.href?.startsWith('http'));

	const parts = [
		`<h1>${escapeHtml(resource.title)}</h1>`,
		`<p><time datetime="${escapeHtml(resource.publish_date)}">${escapeHtml(resource.publish_date)}</time></p>`,
		`<p>${escapeHtml(body)}</p>`,
	];

	if (isThirdParty) {
		parts.push(
			'<p>This page catalogs a third-party resource. The destination is not operated by the Miata Registry.</p>'
		);
	}

	// Internal pages only — never emit external hrefs or file CDN URLs for bots.
	if (resource.kind === 'page' && resource.href?.startsWith('/')) {
		parts.push(
			`<p><a href="${escapeHtml(resource.href)}">Open page</a></p>`
		);
	} else if (resource.kind === 'file') {
		parts.push('<p>A file download is available on this catalog page.</p>');
	}

	return buildBotArticle(parts.join('\n'));
};

export const buildResourcePageMeta = (resource: ResourceBotData): PageMeta => ({
	title: resource.title,
	description: resource.summary,
	path: `/resources/${resource.id}`,
	botContent: buildResourceBotContent(resource),
});

export const STATIC_PAGE_META: Record<
	string,
	Omit<PageMeta, 'path'> & { path: string }
> = {
	'/': {
		path: '/',
		title: 'Miata Registry',
		description: DEFAULT_DESCRIPTION,
		botContent: buildStaticBotContent(
			'Welcome to the Miata Registry',
			`<p>${escapeHtml(DEFAULT_DESCRIPTION)}</p>`
		),
	},
	'/registry': {
		path: '/registry',
		title: 'Cars',
		description: 'A list of all Mazda Miatas in the Miata Registry.',
		botContent: buildStaticBotContent(
			'Browse Cars',
			'<p>A list of all Mazda Miatas in the Miata Registry.</p>'
		),
	},
	'/registry/editions': {
		path: '/registry/editions',
		title: 'Editions',
		description: 'A list of all limited edition Mazda Miatas.',
	},
	'/news': {
		path: '/news',
		title: 'News',
		description: 'News and updates from the Miata Registry.',
		botContent: buildStaticBotContent(
			'Latest Updates',
			'<p>Stay up to date with the latest announcements and updates from the Registry.</p>'
		),
	},
	'/resources': {
		path: '/resources',
		title: 'Resources',
		description:
			'Historical documentation for limited edition Miatas, preserved for the long term, including archives of community registries whose data now lives on in the Miata Registry.',
		botContent: buildStaticBotContent(
			'Resources',
			'<p>Catalog of historical documentation for limited edition Miatas, including community registries and reference material. Third-party destinations listed here are not operated by the Miata Registry.</p>'
		),
	},
	'/rarity': {
		path: '/rarity',
		title: 'Rarity Scores',
		description:
			'How we calculate rarity scores for all Miata Registry cars.',
	},
	'/about': {
		path: '/about',
		title: 'About',
		description:
			'About the Miata Registry, a community-driven project documenting the history of limited edition Mazda Miatas.',
	},
	'/legal': {
		path: '/legal',
		title: 'Legal',
		description: 'Terms, privacy, and licensing for Miata Registry.',
		botContent: buildStaticBotContent(
			'Legal Information',
			'<p>Terms, privacy, and licensing for Miata Registry.</p>'
		),
	},
	'/moderation': {
		path: '/moderation',
		title: 'Moderation',
		description: 'Moderator tools for Miata Registry.',
		noindex: true,
	},
};

export const buildNotFoundHtml = (message = 'Page not found'): string =>
	`<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<title>Not Found – Miata Registry</title>
	<meta name="robots" content="noindex, follow" />
</head>
<body>
	<h1>404 Not Found</h1>
	<p>${escapeHtml(message)}</p>
</body>
</html>`;
