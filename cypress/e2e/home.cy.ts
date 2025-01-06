describe('Home Page', () => {
	beforeEach(() => {
		cy.visit('/');
	});

	it('has working navigation buttons', () => {
		cy.contains('View the registry').should('be.visible').click();
		cy.url().should('include', '/registry');
	});

	it('displays the featured news when available', () => {
		cy.contains('Read more →').should('exist');
	});

	it('opens modals when clicking buttons', () => {
		cy.findByText('Sign In').should('be.visible').click();
		cy.contains('Sign in to Miata Registry').should('be.visible');
		cy.get('body').click(0, 0);

		cy.get('[data-cy="home-claim-your-miata"]').click();
		cy.contains('Account Required').should('be.visible');
		cy.contains('Cancel').click();

		cy.get('[data-cy="home-cta-register-your-miata"]').click();
		cy.contains('Account Required').should('be.visible');
		cy.contains('Cancel').click();

		cy.get('[data-cy="home-cta-submit-a-tip"]').click();
		cy.contains('Submit a Tip').should('be.visible');
		cy.contains('Cancel').click();
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
