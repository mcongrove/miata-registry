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

import { createContext, ReactNode, useContext, useState } from 'react';
import { TipModal } from '../components/forms/TipModal';

type TipContextType = {
	openTipModal: () => void;
	closeTipModal: () => void;
};

const TipContext = createContext<TipContextType | undefined>(undefined);

export function TipProvider({ children }: { children: ReactNode }) {
	const [isTipModalOpen, setIsTipModalOpen] = useState(false);

	const openTipModal = () => setIsTipModalOpen(true);
	const closeTipModal = () => setIsTipModalOpen(false);

	return (
		<TipContext.Provider value={{ openTipModal, closeTipModal }}>
			{children}
			<TipModal isOpen={isTipModalOpen} onClose={closeTipModal} />
		</TipContext.Provider>
	);
}

export function useTipModal() {
	const context = useContext(TipContext);

	if (context === undefined) {
		throw new Error('useTipModal must be used within a TipProvider');
	}

	return context;
}
