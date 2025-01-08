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

describe('News Page', () => {
	beforeEach(() => {
		cy.visit('/news');
	});

	it('shows loading state while fetching news', () => {
		cy.get('.animate-pulse').should('exist');
		cy.get('.bg-brg-light').should('exist');
	});

	it('displays news articles correctly', () => {
		cy.get('.animate-pulse').should('not.exist');

		cy.get('a[href^="/news/"]').each(($article) => {
			cy.wrap($article).find('img').should('have.attr', 'src');
			cy.wrap($article).find('.text-lg').should('exist');
		});
	});

	it('handles article links correctly', () => {
		cy.get('a[href^="/news/"]').first().click();
		cy.url().should('include', '/news/');
	});
});
