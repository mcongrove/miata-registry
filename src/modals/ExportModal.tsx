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

import { useAuth } from '@clerk/clerk-react';
import { useState } from 'react';
import { Modal } from '../components/Modal';

export function ExportModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const { getToken } = useAuth();
	const [loading, setLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const submitDownload = async () => {
		setLoading(true);

		try {
			const token = await getToken();

			const response = await fetch(
				`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/export`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				throw new Error(
					`Download failed: ${response.status} ${response.statusText}`
				);
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);

			const a = document.createElement('a');
			a.href = url;
			a.download = 'miata-registry.zip';
			document.body.appendChild(a);

			a.click();

			window.URL.revokeObjectURL(url);

			document.body.removeChild(a);

			setIsSuccess(true);
		} catch (error) {
			console.error('Download error:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setIsSuccess(false);
		onClose();
	};

	if (isSuccess) {
		return (
			<Modal
				isOpen={isOpen}
				onClose={handleClose}
				hideCancel
				action={{
					text: 'Close',
					onClick: handleClose,
				}}
				allowClickOut
			>
				<div className="flex flex-col items-center gap-6 pt-6">
					<div className="w-16 h-16 rounded-full bg-brg/10 flex items-center justify-center">
						<svg
							className="w-8 h-8 text-brg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>

					<div className="text-center">
						<h2 className="text-2xl font-bold mb-2">Enjoy!</h2>

						<p className="text-brg-mid">
							Your download has begun. Please enjoy the data.
						</p>
					</div>
				</div>
			</Modal>
		);
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Export Registry Dataset"
			action={{
				text: 'I Agree',
				onClick: submitDownload,
				loading,
			}}
			allowClickOut
		>
			<div className="flex flex-col gap-4 text-brg-mid text-sm">
				<p className="text-brg">
					By clicking <strong>"I Agree"</strong>, you agree to the
					following:
				</p>

				<div className="flex flex-col">
					<p>
						&bull; You will not use the data for any purpose other
						than personal research and reference.
					</p>

					<p>&bull; You will not sell the data in any form.</p>

					<p>
						&bull; You will not use the data for commercial purposes
						or marketing activities.
					</p>

					<p>
						&bull; You will not attempt to contact registered owners
						without their explicit consent.
					</p>

					<p>
						&bull; You will not share access to the downloaded
						dataset with others.
					</p>

					<p>
						&bull; You acknowledge that the data is provided "as is"
						without any warranty.
					</p>

					<p>
						&bull; You will report any data inaccuracies or security
						concerns to the registry administrators.
					</p>
				</div>
			</div>
		</Modal>
	);
}
