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

describe('Car Page', () => {
	beforeEach(() => {
		cy.visit('/registry/63621393-a540-46b5-b9fe-9231fea2730f');
	});

	it('has car data', () => {
		cy.contains('1991 Special Edition (US)').should('be.visible');

		cy.contains('Very Rare').should('be.visible');

		cy.get('img[src*="63621393-a540-46b5-b9fe-9231fea2730f"]')
			.should('be.visible')
			.and('have.prop', 'naturalWidth')
			.should('be.greaterThan', 0);

		cy.contains('1.6L 4-cyl 116–127hp').should('be.visible');

		cy.contains('The 1991 Special Edition represents').should('be.visible');
	});

	it('has actions and links', () => {
		cy.get('a[href*="https://instagram.com/brg.182"]').should('be.visible');

		cy.contains('Claim this Car').should('be.visible');
	});

	it('has sale data', () => {
		cy.contains('$21,423').should('be.visible');
		cy.contains('February 5, 1991').should('be.visible');
		cy.contains('Marin Mazda').should('be.visible');
		cy.contains('San Rafael, CA, US').should('be.visible');
	});

	it('has timeline/location data and Google map', () => {
		cy.get('[aria-label="Japan"]').should('exist');
		cy.get('[aria-label="California"]').should('exist');
		cy.get('[aria-label="Nevada"]').should('exist');
		cy.get('[aria-label="Texas"]').should('be.visible');

		cy.get('[data-cy="car-location-city"]')
			.should('be.visible')
			.and('have.text', 'Austin');

		cy.contains('Russel Hertzog').should('be.visible');
		cy.contains('2022 – 2024').should('be.visible');
		cy.contains('Georgetown, TX, US').should('be.visible');

		cy.contains('Sold by Marin Mazda').should('be.visible');
		cy.contains('February 5, 1991').should('be.visible');

		cy.contains('Shipped via Asian Highway').should('be.visible');

		cy.contains('Built by Mazda Motor Corporation').should('be.visible');
		cy.contains('December 6, 1990 at 10:40 PM').should('be.visible');
		cy.contains('Hofu, Yamaguchi, JP').should('be.visible');
	});
});
