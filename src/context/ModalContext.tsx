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

import {
	createContext,
	lazy,
	ReactNode,
	Suspense,
	useContext,
	useState,
} from 'react';
import { TModalState, TModalType } from '../types/Modal';

const MODAL_COMPONENTS = {
	export: lazy(() =>
		import('../modals/ExportModal').then((module) => ({
			default: module.ExportModal,
		}))
	),
	news: lazy(() =>
		import('../modals/NewsModal').then((module) => ({
			default: module.NewsModal,
		}))
	),
	qr: lazy(() =>
		import('../modals/QrModal').then((module) => ({
			default: module.QrModal,
		}))
	),
	register: lazy(() =>
		import('../modals/RegisterModal').then((module) => ({
			default: module.RegisterModal,
		}))
	),
	tip: lazy(() =>
		import('../modals/TipModal').then((module) => ({
			default: module.TipModal,
		}))
	),
} as const;

type TModalComponentKeys = keyof typeof MODAL_COMPONENTS;

type ModalContextType = {
	openModal: (type: TModalType, props?: Record<string, unknown>) => void;
	closeModal: () => void;
	modalState: TModalState;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
	const [modalState, setModalState] = useState<TModalState>({ type: null });

	const openModal = (type: TModalType, props?: Record<string, unknown>) => {
		setModalState({ type, props });
	};

	const closeModal = () => {
		setModalState({ type: null });
	};

	const renderModal = () => {
		if (!modalState.type) return null;

		const ModalComponent =
			MODAL_COMPONENTS[modalState.type as TModalComponentKeys];

		return (
			<Suspense
				fallback={
					<div className="w-full h-full flex items-center justify-center">
						Loading...
					</div>
				}
			>
				<ModalComponent
					isOpen={true}
					onClose={closeModal}
					{...modalState.props}
				/>
			</Suspense>
		);
	};

	return (
		<ModalContext.Provider value={{ openModal, closeModal, modalState }}>
			{children}
			{renderModal()}
		</ModalContext.Provider>
	);
}

export function useModal() {
	const context = useContext(ModalContext);

	if (context === undefined) {
		throw new Error('useModal must be used within a ModalProvider');
	}

	return context;
}
