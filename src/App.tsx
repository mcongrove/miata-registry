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

import { ClerkProvider, useUser } from '@clerk/clerk-react';
import { lazy, Suspense, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
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
import { ModalProvider } from './context/ModalContext';
import { Home } from './pages/Home';

const About = lazy(() =>
	import('./pages/About').then((module) => ({ default: module.About }))
);

const CarProfile = lazy(() =>
	import('./pages/Car').then((module) => ({ default: module.CarProfile }))
);

const Editions = lazy(() =>
	import('./pages/Editions').then((module) => ({ default: module.Editions }))
);

const Legal = lazy(() =>
	import('./pages/Legal').then((module) => ({ default: module.Legal }))
);

const Moderation = lazy(() =>
	import('./pages/Moderation').then((module) => ({
		default: module.Moderation,
	}))
);

const News = lazy(() =>
	import('./pages/News').then((module) => ({ default: module.News }))
);

const NewsArticle = lazy(() =>
	import('./pages/NewsArticle').then((module) => ({
		default: module.NewsArticle,
	}))
);

const Rarity = lazy(() =>
	import('./pages/Rarity').then((module) => ({ default: module.Rarity }))
);

const Registry = lazy(() =>
	import('./pages/Registry').then((module) => ({ default: module.Registry }))
);

function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return null;
}

const Layout = () => (
	<div className="min-h-screen flex flex-col">
		<ScrollToTop />
		<Header />
		<Outlet />
		<Footer />
	</div>
);

const Fallback = () => <div className="min-h-screen" />;

function AppRoutes() {
	const { user } = useUser();

	return (
		<Routes>
			<Route element={<Layout />}>
				<Route path="/" element={<Home />} />
				<Route
					path="/about"
					element={
						<Suspense fallback={<Fallback />}>
							<About />
						</Suspense>
					}
				/>
				<Route
					path="/legal"
					element={
						<Suspense fallback={<Fallback />}>
							<Legal />
						</Suspense>
					}
				/>
				{Boolean(user?.publicMetadata?.moderator) && (
					<Route
						path="/moderation"
						element={
							<Suspense fallback={<Fallback />}>
								<Moderation />
							</Suspense>
						}
					/>
				)}
				<Route
					path="/news"
					element={
						<Suspense fallback={<Fallback />}>
							<News />
						</Suspense>
					}
				/>
				<Route
					path="/news/:id"
					element={
						<Suspense fallback={<Fallback />}>
							<NewsArticle />
						</Suspense>
					}
				/>
				<Route
					path="/rarity"
					element={
						<Suspense fallback={<Fallback />}>
							<Rarity />
						</Suspense>
					}
				/>
				<Route
					path="/registry"
					element={
						<Suspense fallback={<Fallback />}>
							<Registry />
						</Suspense>
					}
				/>
				<Route
					path="/registry/:id"
					element={
						<Suspense fallback={<Fallback />}>
							<CarProfile />
						</Suspense>
					}
				/>
				<Route
					path="/registry/editions"
					element={
						<Suspense fallback={<Fallback />}>
							<Editions />
						</Suspense>
					}
				/>
			</Route>
		</Routes>
	);
}

function App() {
	return (
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

			<BrowserRouter>
				<ModalProvider>
					<AppRoutes />
				</ModalProvider>
			</BrowserRouter>
		</ClerkProvider>
	);
}

export default App;
