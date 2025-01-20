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
	carEdit: lazy(() =>
		import('../modals/CarEdit').then((module) => ({
			default: module.CarEdit,
		}))
	),
	qrCode: lazy(() =>
		import('../modals/QrCode').then((module) => ({
			default: module.QrCode,
		}))
	),
	register: lazy(() =>
		import('../modals/Register').then((module) => ({
			default: module.Register,
		}))
	),
	socialGeneration: lazy(() =>
		import('../modals/SocialGeneration').then((module) => ({
			default: module.SocialGeneration,
		}))
	),
	tip: lazy(() =>
		import('../modals/Tip').then((module) => ({
			default: module.Tip,
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
					props={modalState.props}
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

	if (!context) {
		return {
			openModal: () => {},
			closeModal: () => {},
			currentModal: null,
			modalProps: {},
		};
	}

	return context;
}
