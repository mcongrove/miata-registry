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

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HISTORY_BACK = '__history_back__';

export function useUnsavedLeaveGuard(active: boolean) {
	const navigate = useNavigate();
	const [leaveModalOpen, setLeaveModalOpen] = useState(false);
	const [pendingLeave, setPendingLeave] = useState<string | null>(null);

	const requestLeave = useCallback(
		(destination: string) => {
			if (!active) {
				if (destination === HISTORY_BACK) {
					navigate(-1);
				} else {
					navigate(destination);
				}

				return;
			}

			setPendingLeave(destination);
			setLeaveModalOpen(true);
		},
		[active, navigate]
	);

	const handleStayOnPage = useCallback(() => {
		setLeaveModalOpen(false);
		setPendingLeave(null);
	}, []);

	const handleLeavePage = useCallback(() => {
		const destination = pendingLeave;

		setLeaveModalOpen(false);
		setPendingLeave(null);

		if (!destination) return;

		if (destination === HISTORY_BACK) {
			navigate(-1);
		} else {
			navigate(destination);
		}
	}, [navigate, pendingLeave]);

	useEffect(() => {
		if (!active) return;

		const onClick = (event: MouseEvent) => {
			const anchor = (event.target as HTMLElement).closest('a[href]');

			if (!anchor || anchor.getAttribute('target') === '_blank') {
				return;
			}

			const href = anchor.getAttribute('href');

			if (
				!href ||
				href.startsWith('mailto:') ||
				href.startsWith('tel:')
			) {
				return;
			}

			let path = href;

			if (href.startsWith('http')) {
				try {
					const url = new URL(href);

					if (url.origin !== window.location.origin) {
						return;
					}

					path = url.pathname + url.search + url.hash;
				} catch {
					return;
				}
			}

			if (path === window.location.pathname) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			setPendingLeave(path);
			setLeaveModalOpen(true);
		};

		document.addEventListener('click', onClick, true);

		return () => document.removeEventListener('click', onClick, true);
	}, [active]);

	useEffect(() => {
		if (!active) return;

		const mark = () =>
			window.history.pushState(null, '', window.location.href);

		mark();

		const onPopState = () => {
			setPendingLeave(HISTORY_BACK);
			setLeaveModalOpen(true);
			mark();
		};

		window.addEventListener('popstate', onPopState);

		return () => window.removeEventListener('popstate', onPopState);
	}, [active]);

	useEffect(() => {
		if (!active) return;

		const onBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
		};

		window.addEventListener('beforeunload', onBeforeUnload);

		return () => window.removeEventListener('beforeunload', onBeforeUnload);
	}, [active]);

	return {
		handleLeavePage,
		handleStayOnPage,
		leaveModalOpen,
		requestLeave,
	};
}
