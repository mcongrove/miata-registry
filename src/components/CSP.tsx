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

export const CSP = () => {
	useEffect(() => {
		const meta = document.createElement('meta');

		meta.httpEquiv = 'Content-Security-Policy';

		const devCSP = import.meta.env.DEV ? 'http://localhost:*' : '';

		meta.content = `
			default-src 'self' ${devCSP};
			script-src 'self' 'unsafe-inline' 'unsafe-eval' ${devCSP} *.miataregistry.com *.clerk.accounts.dev *.clerk.services *.cloudflareinsights.com *.fontawesome.com *.googleapis.com challenges.cloudflare.com;
			worker-src 'self' blob: ${devCSP};
			connect-src 'self' ${devCSP} *.miataregistry.com *.clerk.accounts.dev *.clerk.services *.googleapis.com *.sentry.io api.github.com challenges.cloudflare.com vpic.nhtsa.dot.gov;
			img-src 'self' data: ${devCSP} store.miataregistry.com *.clerk.com *.googleapis.com *.gstatic.com flagcdn.com;
			style-src 'self' 'unsafe-inline' ${devCSP} *.googleapis.com *.gstatic.com;
			font-src 'self' ${devCSP} *.fontawesome.com *.gstatic.com;
			frame-src 'self' ${devCSP} *.miataregistry.com *.clerk.accounts.dev challenges.cloudflare.com;
		`
			.replace(/\s+/g, ' ')
			.trim();

		document.head.appendChild(meta);

		return () => {
			document.head.removeChild(meta);
		};
	}, []);

	return null;
};
