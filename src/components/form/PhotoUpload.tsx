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
import imageCompression from 'browser-image-compression';
import { useState } from 'react';
import { handleApiError } from '../../utils/common';

interface PhotoUploadProps {
	carId: string;
}

export function PhotoUpload({ carId }: PhotoUploadProps) {
	const { getToken } = useAuth();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		if (!file) return;

		if (!file.type.startsWith('image/')) {
			setFormError('Please select an image file');

			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			setFormError('File size must be less than 10MB');

			return;
		}

		setLoading(true);

		try {
			const compressedFile = await imageCompression(file, {
				maxSizeMB: 1,
				maxWidthOrHeight: 1000,
				useWebWorker: true,
				fileType: 'image/jpeg',
				initialQuality: 0.3,
			});

			const token = await getToken();
			const formData = new FormData();

			formData.append('photo', compressedFile);

			const response = await fetch(
				`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/photos/${carId}`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				}
			);

			if (!response.ok) {
				throw new Error('Failed to upload photo');
			}

			setSuccess(true);
		} catch (error) {
			handleApiError(error);
			setFormError('Failed to upload photo. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative">
			<input
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				disabled={loading}
				className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
			/>

			<div className="flex items-center justify-center h-32 border-2 border-dashed border-brg-light rounded-lg bg-brg-light/10 text-sm">
				{loading ? (
					<p className="flex gap-2 items-center text-brg-mid">
						<i className="fa-solid fa-spinner fa-spin" />
						Uploading...
					</p>
				) : formError ? (
					<p className="text-red-700">{formError}</p>
				) : success ? (
					<div className="flex flex-col gap-1 items-center justify-center text-brg-mid">
						<i className="fa-solid fa-check text-2xl text-green-700" />

						<p>Uploaded</p>
					</div>
				) : (
					<div className="flex flex-col gap-1 items-center justify-center text-brg-mid">
						<i className="fa-solid fa-camera-retro text-2xl" />

						<p>
							Click or drag to upload{' '}
							<span className="text-brg-border">10MB max</span>
						</p>

						<p className="text-xs text-brg-mid/60">
							Photos will be <em>immediately submitted</em>
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
