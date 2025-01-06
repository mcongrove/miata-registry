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

describe('Home Page', () => {
	beforeEach(() => {
		cy.visit('/');
	});

	it('displays the featured news when available', () => {
		cy.contains('Read more →').should('exist');
	});

	it('has a working Clerk integration', () => {
		cy.findByText('Sign In').should('be.visible').click();
		cy.contains('Sign in to Miata Registry').should('be.visible');
		cy.get('body').click(0, 0);
	});

	it('opens modals when clicking buttons', () => {
		cy.get('[data-cy="home-claim-your-miata"]').click();
		cy.contains('Account Required').should('be.visible');
		cy.contains('button', 'Cancel').click();

		cy.get('[data-cy="home-cta-register-your-miata"]').click();
		cy.contains('Account Required').should('be.visible');
		cy.contains('button', 'Cancel').click();

		cy.get('[data-cy="home-cta-submit-a-tip"]').click();
		cy.contains('Submit a Tip').should('be.visible');
		cy.contains('button', 'Cancel').click();
	});

	it('displays the featured car credit', () => {
		cy.get('[data-credit-id="63621393-a540-46b5-b9fe-9231fea2730f"]')
			.should('be.visible')
			.realHover();
		cy.contains('1991 British Racing Green #182').should('be.visible');
		cy.contains('Matthew Congrove').should('be.visible');
		cy.contains('TX, US').should('be.visible');
	});
});
