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
	const metaUrl = path ? `${baseUrl}${path}` : baseUrl;
	const metaDescription = description || defaultDescription;

	useEffect(() => {
		document.title = metaTitle;

		const canonicalElement = document.querySelector(
			'link[rel="canonical"]'
		);
		const metaDescElement = document.querySelector(
			'meta[name="description"]'
		);
		const ogDescElement = document.querySelector(
			'meta[property="og:description"]'
		);
		const ogTitleElement = document.querySelector(
			'meta[property="og:title"]'
		);
		const ogUrlElement = document.querySelector('meta[property="og:url"]');
		const twitterDescElement = document.querySelector(
			'meta[name="twitter:description"]'
		);
		const twitterTitleElement = document.querySelector(
			'meta[name="twitter:title"]'
		);
		const twitterUrlElement = document.querySelector(
			'meta[name="twitter:url"]'
		);

		if (canonicalElement) canonicalElement.setAttribute('href', metaUrl);
		if (metaDescElement)
			metaDescElement.setAttribute('content', metaDescription);
		if (ogTitleElement) ogTitleElement.setAttribute('content', metaTitle);
		if (twitterTitleElement)
			twitterTitleElement.setAttribute('content', metaTitle);
		if (ogDescElement)
			ogDescElement.setAttribute('content', metaDescription);
		if (twitterDescElement)
			twitterDescElement.setAttribute('content', metaDescription);
		if (ogUrlElement) ogUrlElement.setAttribute('content', metaUrl);
		if (twitterUrlElement)
			twitterUrlElement.setAttribute('content', metaUrl);
	}, [metaTitle, metaDescription, metaUrl]);

	return {
		metaTitle,
		metaUrl,
		metaDescription,
	};
};
