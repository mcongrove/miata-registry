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

describe('Editions Page', () => {
	beforeEach(() => {
		cy.visit('/registry/editions');
	});

	it('has editions data', () => {
		cy.contains('1990 NA').should('be.visible');
	});

	it('has edition photos', () => {
		cy.get('img[src*="3d61d450-e431-446c-883b-42480e6bc6c4"]')
			.should('be.visible')
			.and('have.prop', 'naturalWidth')
			.should('be.greaterThan', 0);
	});

	it('has working edition navigation on mobile', () => {
		cy.viewport(375, 667);

		cy.contains('1990 NA').should('be.visible');

		cy.get('[data-cy="edition-tabs-NB"]').should('be.visible').click();
		cy.contains('1999 NB').should('be.visible');

		cy.get('[data-cy="edition-tabs-NC"]').should('be.visible').click();
		cy.contains('2006 NC').should('be.visible');

		cy.get('[data-cy="edition-tabs-ND"]').should('be.visible').click();
		cy.contains('2019 ND').should('be.visible');
	});
});
