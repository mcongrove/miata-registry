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

import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Editions } from './pages/Editions';
import { Home } from './pages/Home';
import { Registry } from './pages/Registry';
import { CarProfile } from './pages/Car';

function Layout() {
	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<Outlet />
			<Footer />
		</div>
	);
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<Layout />}>
					<Route path="/" element={<Home />} />
					<Route path="/registry" element={<Registry />} />
					<Route path="/registry/editions" element={<Editions />} />
					<Route path="/registry/:id" element={<CarProfile />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
