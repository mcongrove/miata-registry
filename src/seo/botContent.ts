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
		result = result.replace(
			'</body>',
			`${meta.botContent}\n\t</body>`
		);
	}

	return result;
};

export const buildBotArticle = (content: string): string =>
	`<article id="bot-content">${content}</article>`;

const buildBotHeading = (heading: string): string =>
	`<h1>${escapeHtml(heading)}</h1>`;

export const buildStaticBotContent = (
	heading: string,
	body = ''
): string => buildBotArticle(`${buildBotHeading(heading)}${body}`);

export type CarBotData = {
	id: string;
	sequence?: number | null;
	story?: string | null;
	rarity_score?: number | null;
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
	const sequenceSuffix = hasSequence(car.sequence)
		? ` #${car.sequence}`
		: '';
	const color = edition?.color ? `${edition.color}.` : '';
	const produced =
		edition?.total_produced != null
			? ` 1 of ${edition.total_produced.toLocaleString('en-US')} produced.`
			: '';
	const rarity =
		car.rarity_score != null
			? ` Rarity score: ${car.rarity_score}.`
			: '';
	const claimed = car.current_owner_id ? ' Claimed.' : ' Unclaimed.';

	const summary = `${year} ${name}${sequenceSuffix}. ${color}${produced}${rarity}${claimed}`;

	const parts = [
		`<h1>${escapeHtml(`${year} ${name}`.trim())}</h1>`,
		`<p>${escapeHtml(summary.trim())}</p>`,
	];

	if (edition?.description) {
		parts.push(
			`<p>${escapeHtml(edition.description.split('\n')[0])}</p>`
		);
	}

	if (car.story?.trim()) {
		parts.push(`<p>${escapeHtml(car.story.trim())}</p>`);
	}

	return buildBotArticle(parts.join('\n'));
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
};

export const buildEditionsBotContent = (editions: EditionRow[]): string => {
	const rows = editions
		.map(
			(edition) =>
				`<tr><td>${edition.year}</td><td>${escapeHtml(edition.name)}</td><td>${escapeHtml(edition.generation)}</td><td>${escapeHtml(edition.color)}</td><td>${edition.total_produced?.toLocaleString('en-US') ?? '—'}</td><td>${edition.in_registry}</td><td>${edition.claimed}</td></tr>`
		)
		.join('\n');

	return buildBotArticle(
		`${buildBotHeading('Limited Edition Models')}<table><thead><tr><th>Year</th><th>Name</th><th>Generation</th><th>Color</th><th>Produced</th><th>In registry</th><th>Claimed</th></tr></thead><tbody>${rows}</tbody></table>`
	);
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
