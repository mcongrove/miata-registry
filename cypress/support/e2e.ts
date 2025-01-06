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

import '@testing-library/cypress/add-commands';
import 'cypress-real-events/support';

declare global {
	namespace Cypress {
		interface Chainable {
			findByText(
				id: string | RegExp,
				options?: any
			): Chainable<JQuery<HTMLElement>>;

			findByRole(
				role: string,
				options?: any
			): Chainable<JQuery<HTMLElement>>;

			findByLabelText(
				label: string | RegExp,
				options?: any
			): Chainable<JQuery<HTMLElement>>;

			findByTestId(
				testId: string,
				options?: any
			): Chainable<JQuery<HTMLElement>>;

			findByPlaceholderText(
				placeholder: string | RegExp,
				options?: any
			): Chainable<JQuery<HTMLElement>>;

			findAllByText(
				text: string | RegExp,
				options?: any
			): Chainable<JQuery<HTMLElement>>;

			realHover(options?: {
				pointer?: 'mouse' | 'touch';
				position?:
					| 'topLeft'
					| 'top'
					| 'topRight'
					| 'left'
					| 'center'
					| 'right'
					| 'bottomLeft'
					| 'bottom'
					| 'bottomRight';
				scrollBehavior?: 'center' | 'top' | 'bottom' | 'nearest';
			}): Chainable<JQuery<HTMLElement>>;
		}
	}
}

beforeEach(() => {
	cy.intercept('*', (req) => {
		req.on('response', (res) => {
			if (res.statusCode === 403 || res.statusCode === 401) {
				Cypress.log({
					name: 'Network Error',
					message: `Request to ${req.url} was blocked with status ${res.statusCode}`,
					consoleProps: () => ({
						'Request URL': req.url,
						'Status Code': res.statusCode,
						'Response Headers': res.headers,
					}),
				});
			} else if (res.statusCode === 404) {
				Cypress.log({
					name: 'Network Error',
					message: `Request to ${req.url} was not found`,
					consoleProps: () => ({
						'Request URL': req.url,
						'Status Code': res.statusCode,
						'Response Headers': res.headers,
					}),
				});
			} else if (res.statusCode >= 400 && res.statusCode < 600) {
				Cypress.log({
					name: 'Network Error',
					message: `Request to ${req.url} failed with status ${res.statusCode}`,
					consoleProps: () => ({
						'Request URL': req.url,
						'Status Code': res.statusCode,
						'Response Headers': res.headers,
					}),
				});
			}
		});
	});
});
