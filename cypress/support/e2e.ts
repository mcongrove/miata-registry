import '@testing-library/cypress/add-commands';
import 'cypress-real-events/support';

declare global {
	namespace Cypress {
		interface Chainable {
			findByText(
				id: string | RegExp,
				options?: any
			): Chainable<JQuery<HTMLElement>>;

			findByRole(
				role: string,
				options?: any
			): Chainable<JQuery<HTMLElement>>;

			findByLabelText(
				label: string | RegExp,
				options?: any
			): Chainable<JQuery<HTMLElement>>;

			findByTestId(
				testId: string,
				options?: any
			): Chainable<JQuery<HTMLElement>>;

			findByPlaceholderText(
				placeholder: string | RegExp,
				options?: any
			): Chainable<JQuery<HTMLElement>>;

			findAllByText(
				text: string | RegExp,
				options?: any
			): Chainable<JQuery<HTMLElement>>;

			realHover(options?: {
				pointer?: 'mouse' | 'touch';
				position?:
					| 'topLeft'
					| 'top'
					| 'topRight'
					| 'left'
					| 'center'
					| 'right'
					| 'bottomLeft'
					| 'bottom'
					| 'bottomRight';
				scrollBehavior?: 'center' | 'top' | 'bottom' | 'nearest';
			}): Chainable<JQuery<HTMLElement>>;
		}
	}
}

beforeEach(() => {
	cy.session('preserve-cookies', () => {
		// Any authentication setup if needed
	});
});
