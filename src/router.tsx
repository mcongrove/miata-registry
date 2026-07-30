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

import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { createBrowserRouter, Outlet, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { ErrorBoundary } from './components/ErrorBoundary';
import { JsonLd } from './components/JsonLd';
import { ModalProvider } from './context/ModalContext';
import { Home } from './pages/Home';
import { organizationWebSite } from './utils/jsonLd';

const About = lazy(() =>
	import('./pages/About').then((module) => ({ default: module.About }))
);

const CarProfile = lazy(() =>
	import('./pages/Car').then((module) => ({ default: module.CarProfile }))
);

const CarSettings = lazy(() =>
	import('./pages/CarSettings').then((module) => ({
		default: module.CarSettings,
	}))
);

const Edition = lazy(() =>
	import('./pages/Edition').then((module) => ({ default: module.Edition }))
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
		<JsonLd data={organizationWebSite()} />
		<ScrollToTop />
		<Header />
		<Outlet />
		<Footer />
	</div>
);

const Fallback = () => <div className="min-h-screen" />;

const suspense = (page: ReactNode) => (
	<Suspense fallback={<Fallback />}>{page}</Suspense>
);

const AppShell = () => (
	<ErrorBoundary>
		<ModalProvider>
			<Layout />
		</ModalProvider>
	</ErrorBoundary>
);

export const router = createBrowserRouter([
	{
		element: <AppShell />,
		children: [
			{ path: '/', element: <Home /> },
			{ path: '/about', element: suspense(<About />) },
			{ path: '/legal', element: suspense(<Legal />) },
			{ path: '/moderation', element: suspense(<Moderation />) },
			{ path: '/news', element: suspense(<News />) },
			{ path: '/news/:id', element: suspense(<NewsArticle />) },
			{ path: '/rarity', element: suspense(<Rarity />) },
			{ path: '/registry', element: suspense(<Registry />) },
			{ path: '/registry/editions', element: suspense(<Editions />) },
			{
				path: '/registry/editions/:slug',
				element: suspense(<Edition />),
			},
			{
				path: '/registry/:id/settings',
				element: suspense(<CarSettings />),
			},
			{ path: '/registry/:id', element: suspense(<CarProfile />) },
		],
	},
]);
