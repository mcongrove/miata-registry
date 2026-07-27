/**
 * Miata Registry
 * Copyright (C) 2024-2026 Matthew Congrove
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

import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';
import { CSP } from './components/CSP';
import { GoogleMapsProvider } from './context/GoogleMapsContext';
import { router } from './router';

function App() {
	return (
		<GoogleMapsProvider>
			<ClerkProvider
				publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
				afterSignOutUrl="/"
				localization={{
					userButton: {
						action__manageAccount: 'Account Settings',
					},
					userProfile: {
						start: {
							headerTitle__account: 'Account Settings',
						},
						navbar: {
							account: 'Account',
						},
					},
				}}
			>
				<CSP />
				<Toaster />
				<RouterProvider router={router} />
			</ClerkProvider>
		</GoogleMapsProvider>
	);
}

export default App;
