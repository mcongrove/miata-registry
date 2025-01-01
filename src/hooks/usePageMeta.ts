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

import { useEffect } from 'react';

interface PageMetaProps {
	title?: string;
	description?: string;
	path?: string;
}

export const usePageMeta = ({ title, description, path }: PageMetaProps) => {
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
			attr?: string
		) => {
			let element = document.querySelector(selector);

			if (!element) {
				element = document.createElement('meta');

				element.setAttribute(attr || 'content', content);

				document.head.appendChild(element);
			}

			element.setAttribute(attr || 'content', content);
		};

		updateMetaTag('meta[name="description"]', metaDescription);
		updateMetaTag('meta[property="og:title"]', metaTitle);
		updateMetaTag('meta[property="og:description"]', metaDescription);
		updateMetaTag('meta[property="og:url"]', metaUrl);
		updateMetaTag('meta[name="twitter:title"]', metaTitle);
		updateMetaTag('meta[name="twitter:description"]', metaDescription);
		updateMetaTag('meta[name="twitter:url"]', metaUrl);
		updateMetaTag('link[rel="canonical"]', metaUrl, 'href');

		if (path === '/') {
			const preloadLink = document.createElement('link');

			preloadLink.rel = 'preload';
			preloadLink.fetchPriority = 'high';
			preloadLink.as = 'image';
			preloadLink.href =
				'https://store.miataregistry.com/app/car/1991SE182.jpg';
			preloadLink.type = 'image/jpeg';

			document.head.appendChild(preloadLink);

			return () => {
				document.head.removeChild(preloadLink);
			};
		}

		const registryMatch = path?.match(/^\/registry\/(.+)$/);

		if (registryMatch) {
			const preloadLink = document.createElement('link');

			preloadLink.rel = 'preload';
			preloadLink.fetchPriority = 'high';
			preloadLink.as = 'image';
			preloadLink.href = `https://store.miataregistry.com/car/${registryMatch[1]}.jpg`;
			preloadLink.type = 'image/jpeg';

			document.head.appendChild(preloadLink);

			return () => {
				document.head.removeChild(preloadLink);
			};
		}
	}, [metaTitle, metaDescription, metaUrl]);
};
