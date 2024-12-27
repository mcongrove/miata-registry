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

import { useEffect } from 'react';
import {
	BrowserRouter,
	Outlet,
	Route,
	Routes,
	useLocation,
} from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { TipProvider } from './context/TipContext';
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

function Layout() {
	return (
		<div className="min-h-screen flex flex-col">
			<ScrollToTop />
			<Header />
			<Outlet />
			<Footer />
		</div>
	);
}

function App() {
	return (
		<TipProvider>
			<BrowserRouter>
				<Routes>
					<Route element={<Layout />}>
						<Route path="/" element={<Home />} />
						<Route path="/about" element={<About />} />
						<Route path="/legal" element={<Legal />} />
						<Route path="/registry" element={<Registry />} />
						<Route path="/registry/:id" element={<CarProfile />} />
						<Route
							path="/registry/editions"
							element={<Editions />}
						/>
					</Route>
				</Routes>
			</BrowserRouter>
		</TipProvider>
	);
}

export default App;
