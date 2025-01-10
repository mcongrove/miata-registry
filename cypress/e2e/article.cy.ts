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

describe('Article Page', () => {
	beforeEach(() => {
		cy.visit('/news/b6f58e83-4fb2-4ddb-a05c-78aee1531a93');
	});

	it('shows loading state while fetching article', () => {
		cy.get('.animate-pulse').should('exist');
		cy.get('.bg-brg-light').should('exist');
	});

	it('displays article content correctly', () => {
		cy.get('.animate-pulse').should('not.exist');

		cy.get('h1').should('have.class', 'text-4xl');
		cy.get('.text-brg-mid').should('exist');
		cy.get('img')
			.should('have.attr', 'src')
			.and('include', 'b6f58e83-4fb2-4ddb-a05c-78aee1531a93.jpg');
	});

	it('handles back to news navigation', () => {
		cy.contains('← Back to News').should('be.visible').click();
		cy.url().should('include', '/news');
	});

	it('displays error state for non-existent article', () => {
		cy.visit('/news/non-existent-article');

		cy.contains('Article Not Found').should('be.visible');
		cy.contains(
			"The article you're looking for doesn't exist or has been removed"
		).should('be.visible');
	});
});
