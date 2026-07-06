import { render } from '@react-email/render';
import type { ReactElement } from 'react';

export function renderEmail(element: ReactElement) {
	return render(element);
}
