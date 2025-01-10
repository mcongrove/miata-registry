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

describe('Forms', () => {
	beforeEach(() => {
		cy.visit('/');
	});

	it('can submit the tip form', () => {
		cy.get('[data-cy="header-registry"]').realHover();
		cy.get('[data-cy="header-submit-a-tip"]').should('be.visible').click();
		cy.contains('Submit a Tip').should('be.visible');

		const formData = {
			edition_name: '1991 British Racing Green',
			sequence: '123',
			vin: 'JM1NA2155N0000000',
			owner_name: 'Cypress Test',
			owner_location: 'Austin, TX, US',
			information: 'This is a test message',
			user_id: null,
		};

		cy.intercept('POST', '/tips').as('formTipRequest');

		cy.get('[name="edition_name"]')
			.should('be.visible')
			.select(formData.edition_name);
		cy.get('[name="sequence"]')
			.should('be.visible')
			.type(formData.sequence);
		cy.get('[name="vin"]').should('be.visible').type(formData.vin);
		cy.get('[name="owner_name"]')
			.should('be.visible')
			.type(formData.owner_name);
		cy.get('[name="owner_location"]')
			.should('be.visible')
			.type(formData.owner_location);
		cy.get('[name="information"]')
			.should('be.visible')
			.type(formData.information);

		cy.get('form#tipForm').submit();

		cy.wait('@formTipRequest').then((interception) => {
			expect(interception.response?.statusCode).to.equal(200);

			const responseBody = interception.response?.body;

			expect(responseBody.success).to.be.true;
			expect(responseBody.tipId).to.be.a('string');
			expect(responseBody.data).to.deep.equal({
				...formData,
				id: responseBody.tipId,
				created_at: responseBody.data.created_at,
			});
		});

		cy.contains('Thank You!').should('be.visible');
	});
});
