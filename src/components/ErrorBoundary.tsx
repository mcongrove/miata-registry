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

import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
	children: ReactNode;
};

type ErrorBoundaryState = {
	error: Error | null;
};

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	state: ErrorBoundaryState = { error: null };

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error('ErrorBoundary caught:', error, info.componentStack);
	}

	render() {
		if (this.state.error) {
			return (
				<main className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 py-16 text-center">
					<h1 className="text-2xl font-semibold text-brg">
						Something went wrong
					</h1>
					<p className="max-w-md text-sm text-brg-mid">
						{this.state.error.message ||
							'An unexpected error occurred.'}
					</p>
					<a
						href="/"
						className="rounded-lg bg-brg px-4 py-2 text-sm font-medium text-white hover:bg-brg/90"
					>
						Back to home
					</a>
				</main>
			);
		}

		return this.props.children;
	}
}
