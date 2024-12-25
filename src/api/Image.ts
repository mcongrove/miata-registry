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

import { getAuth } from 'firebase/auth';

interface UploadResponse {
	uploadUrl: string;
	imageId: string;
}

export function getImage(carId: string): string {
	return `https://miataregistry.com/store/car/${carId}.jpg`;
}

export async function uploadImage(file: File, carEditionId: string) {
	const auth = getAuth();
	const user = auth.currentUser;

	if (!user) {
		throw new Error('Authentication required');
	}

	const token = await user.getIdToken();

	const response = await fetch(
		`${process.env.VITE_CLOUDFLARE_WORKER_URL}/upload`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ carEditionId }),
		}
	);

	if (!response.ok) {
		throw new Error('Failed to get upload URL');
	}

	const { uploadUrl, imageId }: UploadResponse = await response.json();

	await fetch(uploadUrl, {
		method: 'PUT',
		body: file,
	});

	return imageId;
}

export async function deleteImage(imageId: string) {
	const auth = getAuth();
	const user = auth.currentUser;

	if (!user) {
		throw new Error('Authentication required');
	}

	const token = await user.getIdToken();

	const response = await fetch(
		`${process.env.VITE_CLOUDFLARE_WORKER_URL}/delete/${imageId}`,
		{
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) {
		throw new Error('Failed to delete image');
	}
}
