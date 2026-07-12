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

import { useEffect } from 'react';

interface PageMetaProps {
	title?: string;
	description?: string;
	path?: string;
	noindex?: boolean;
	prev?: string;
	next?: string;
}

const toFullUrl = (baseUrl: string, urlOrPath: string) => {
	if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
		return urlOrPath;
	}

	return `${baseUrl}${urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`}`;
};

export const usePageMeta = ({
	title,
	description,
	path,
	noindex,
	prev,
	next,
}: PageMetaProps) => {
	const baseUrl = 'https://miataregistry.com';
	const defaultDescription =
		'A community-driven project documenting the history of limited edition Mazda Miatas.';

	const metaTitle = title ? `${title} – Miata Registry` : 'Miata Registry';
	const metaUrl = path ? `${baseUrl}${path.replace(/\/$/, '')}` : baseUrl;
	const metaDescription = description || defaultDescription;

	useEffect(() => {
		document.title = metaTitle;

		const updateMetaTag = (
			selector: string,
			content: string,
			valueAttr: string = 'content'
		) => {
			let element = document.querySelector(selector);

			if (!element) {
				if (selector.startsWith('link')) {
					element = document.createElement('link');
					const relMatch = selector.match(/rel="([^"]+)"/);

					if (relMatch) {
						element.setAttribute('rel', relMatch[1]);
					}
				} else {
					element = document.createElement('meta');
					const nameMatch = selector.match(/name="([^"]+)"/);

					if (nameMatch) {
						element.setAttribute('name', nameMatch[1]);
					}

					const propertyMatch = selector.match(/property="([^"]+)"/);

					if (propertyMatch) {
						element.setAttribute('property', propertyMatch[1]);
					}
				}

				document.head.appendChild(element);
			}

			element.setAttribute(valueAttr, content);
		};

		updateMetaTag('meta[name="description"]', metaDescription);
		updateMetaTag('meta[property="og:title"]', metaTitle);
		updateMetaTag('meta[property="og:description"]', metaDescription);
		updateMetaTag('meta[property="og:url"]', metaUrl);
		updateMetaTag('meta[name="twitter:title"]', metaTitle);
		updateMetaTag('meta[name="twitter:description"]', metaDescription);
		updateMetaTag('meta[name="twitter:url"]', metaUrl);
		updateMetaTag('link[rel="canonical"]', metaUrl, 'href');

		if (noindex === true) {
			updateMetaTag('meta[name="robots"]', 'noindex, follow');
		} else if (noindex === false) {
			updateMetaTag('meta[name="robots"]', 'index, follow');
		}

		const updateLinkRel = (rel: 'prev' | 'next', href?: string) => {
			const selector = `link[rel="${rel}"]`;
			let element = document.querySelector(selector);

			if (!href) {
				element?.remove();
				return;
			}

			const fullUrl = toFullUrl(baseUrl, href);

			if (!element) {
				element = document.createElement('link');
				element.setAttribute('rel', rel);
				document.head.appendChild(element);
			}

			element.setAttribute('href', fullUrl);
		};

		updateLinkRel('prev', prev);
		updateLinkRel('next', next);

		const cleanupFns: (() => void)[] = [];

		if (path === '/') {
			const preloadLink = document.createElement('link');

			preloadLink.rel = 'preload';
			preloadLink.fetchPriority = 'high';
			preloadLink.as = 'image';
			preloadLink.href =
				'https://store.miataregistry.com/app/car/1991SE182.jpg';
			preloadLink.type = 'image/jpeg';

			document.head.appendChild(preloadLink);
			cleanupFns.push(() => preloadLink.remove());
		} else {
			const registryMatch = path?.match(/^\/registry\/(.+)$/);

			if (registryMatch) {
				const preloadLink = document.createElement('link');

				preloadLink.rel = 'preload';
				preloadLink.fetchPriority = 'high';
				preloadLink.as = 'image';
				preloadLink.href = `https://store.miataregistry.com/car/${registryMatch[1]}.jpg`;
				preloadLink.type = 'image/jpeg';

				document.head.appendChild(preloadLink);
				cleanupFns.push(() => preloadLink.remove());
			}
		}

		return () => {
			cleanupFns.forEach((fn) => fn());
			document.querySelector('link[rel="prev"]')?.remove();
			document.querySelector('link[rel="next"]')?.remove();
		};
	// path is reflected in metaUrl; omit path to avoid duplicate title/meta updates
	// eslint-disable-next-line react-hooks/exhaustive-deps -- metaUrl derives from path
	}, [metaTitle, metaDescription, metaUrl, noindex, prev, next]);
};
