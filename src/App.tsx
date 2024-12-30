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

import { ClerkProvider } from '@clerk/clerk-react';
import { useEffect } from 'react';
import {
	BrowserRouter,
	Outlet,
	Route,
	Routes,
	useLocation,
} from 'react-router-dom';
import { CSP } from './components/CSP';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { GoogleMapsProvider } from './context/GoogleMapsContext';
import { ModalProvider } from './context/ModalContext';
import { About } from './pages/About';
import { CarProfile } from './pages/Car';
import { Editions } from './pages/Editions';
import { Home } from './pages/Home';
import { Legal } from './pages/Legal';
import { Registry } from './pages/Registry';

function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return null;
}

const Layout = () => (
	<div className="min-h-screen flex flex-col">
		<div>
			<ScrollToTop />
			<Header />
			<Outlet />
			<Footer />
		</div>
	</div>
);

function App() {
	return (
		<ClerkProvider
			publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
			afterSignOutUrl="/"
		>
			<CSP />
			<GoogleMapsProvider>
				<ModalProvider>
					<BrowserRouter>
						<Routes>
							<Route element={<Layout />}>
								<Route path="/" element={<Home />} />
								<Route path="/about" element={<About />} />
								<Route path="/legal" element={<Legal />} />
								<Route
									path="/registry"
									element={<Registry />}
								/>
								<Route
									path="/registry/:id"
									element={<CarProfile />}
								/>
								<Route
									path="/registry/editions"
									element={<Editions />}
								/>
							</Route>
						</Routes>
					</BrowserRouter>
				</ModalProvider>
			</GoogleMapsProvider>
		</ClerkProvider>
	);
}

export default App;
