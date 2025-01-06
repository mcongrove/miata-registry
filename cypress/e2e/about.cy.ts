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

describe('About Page', () => {
	beforeEach(() => {
		cy.visit('/about');
	});

	it('has registry statistics', () => {
		cy.get('[data-cy="stat-total-vehicles"]')
			.should('be.visible')
			.invoke('text')
			.should('match', /[\d,]+/);

		cy.get('[data-cy="stat-claimed-vehicles"]')
			.should('be.visible')
			.invoke('text')
			.should('match', /[\d,]+/);

		cy.get('[data-cy="stat-limited-editions"]')
			.should('be.visible')
			.invoke('text')
			.should('match', /[\d,]+/);

		cy.get('[data-cy="stat-countries-represented"]')
			.should('be.visible')
			.invoke('text')
			.should('match', /[\d,]+/);

		cy.get('[data-cy="stat-code-releases"]')
			.should('be.visible')
			.invoke('text')
			.should('match', /[\d,]+/);
	});

	it('does not display the export data link when not signed in', () => {
		cy.get('[data-cy="about-data-export-link"]').should('not.exist');
	});

	it('can submit the contact form', () => {
		const formData = {
			name: 'Cypress Test',
			email: 'cypress@miataregistry.com',
			message: 'This is a test message',
		};

		cy.intercept('POST', '/email/contact').as('formContactRequest');

		cy.get('[name="name"]').should('be.visible').type(formData.name);
		cy.get('[name="email"]').type(formData.email);
		cy.get('[name="message"]').type(formData.message);

		cy.contains('button', 'Send Message').click();

		cy.wait('@formContactRequest').then((interception) => {
			expect(interception.response?.statusCode).to.equal(200);

			expect(interception.response?.body).to.deep.equal({
				success: true,
				data: formData,
			});
		});

		cy.contains(
			"Thanks for your message, we'll get back to you soon."
		).should('be.visible');
	});
});
