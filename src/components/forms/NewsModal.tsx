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

import { Link } from 'react-router-dom';
import { Modal } from '../Modal';

interface NewsModalProps {
	isOpen: boolean;
	onClose: () => void;
	news?: {
		title: string;
		title_short: string;
		body: string;
		created_at: number;
	};
}

export function NewsModal({ isOpen, onClose, news }: NewsModalProps) {
	if (!news) {
		return null;
	}

	const date = new Date(news.created_at * 1000);

	const formattedDate = date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={news.title}
			hideCancel
			action={{ text: 'Close', onClick: onClose }}
			allowClickOut
		>
			<div className="flex flex-col gap-3">
				<div className="text-xs font-medium text-brg">
					{formattedDate}
				</div>

				<div className="text-brg-mid whitespace-pre-wrap space-y-4">
					{news.body
						.split('\n')
						.map((paragraph: string, index: number) => (
							<p key={index}>{paragraph}</p>
						))}
				</div>

				<Link
					to="/registry/63621393-a540-46b5-b9fe-9231fea2730f"
					className="text-xs font-medium text-brg hover:text-brg-dark"
					onClick={onClose}
				>
					<h4>— &nbsp;Matthew Congrove</h4>
					<h5>
						<span className="opacity-0">— &nbsp;</span>1991 BRG #182
					</h5>
				</Link>
			</div>
		</Modal>
	);
}
