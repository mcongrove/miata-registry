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

describe('Footer', () => {
	beforeEach(() => {
		cy.visit('/');
	});

	it('has working navigation buttons', () => {
		cy.get('[data-cy="footer-browse-the-cars"]')
			.should('be.visible')
			.click();
		cy.url().should('include', '/registry');
	});

	it('opens modals when clicking buttons', () => {
		cy.get('[data-cy="footer-register-your-miata"]')
			.should('be.visible')
			.click();
		cy.contains('Account Required').should('be.visible');
		cy.contains('button', 'Cancel').should('be.visible').click();

		cy.get('[data-cy="footer-submit-a-tip"]').should('be.visible').click();
		cy.contains('Submit a Tip').should('be.visible');
		cy.contains('button', 'Cancel').should('be.visible').click();
	});
});
