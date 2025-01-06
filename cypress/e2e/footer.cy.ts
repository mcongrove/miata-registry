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
		cy.get('[data-cy="footer-register-your-miata"]').click();
		cy.contains('Account Required').should('be.visible');
		cy.contains('Cancel').click();

		cy.get('[data-cy="footer-submit-a-tip"]').click();
		cy.contains('Submit a Tip').should('be.visible');
		cy.contains('Cancel').click();
	});
});
