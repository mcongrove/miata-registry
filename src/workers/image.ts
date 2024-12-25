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

interface ImageMetadata {
	carId: string;
	timestamp: number;
}

type WorkerContext = {
	env: any;
	request: Request;
	params: any;
};

export async function onRequest(context: WorkerContext) {
	try {
		switch (context.request.method) {
			case 'POST':
				return handleUpload(context);
			case 'DELETE':
				return handleDelete(context);
			default:
				return new Response('Method not allowed', { status: 405 });
		}
	} catch (error) {
		return new Response('Server error', { status: 500 });
	}
}

async function handleUpload(context: WorkerContext) {
	const { carId } = await context.request.json();
	const filePath = `car/${carId}.jpg`;

	const metadata: ImageMetadata = {
		carId,
		timestamp: Date.now(),
	};

	const uploadUrl = await context.env.IMAGES.createPresignedPost({
		key: filePath,
		metadata,
		maxUploads: 1,
		expires: 600,
		contentType: 'image/jpeg',
		transformations: [
			{
				width: 1000,
				height: 1000,
				fit: 'inside',
				format: 'jpeg',
				quality: 85,
			},
		],
	});

	return Response.json({ uploadUrl, imageId: filePath });
}

async function handleDelete(context: WorkerContext) {
	const { carId } = context.params;
	const filePath = `car/${carId}.jpg`;

	const image = await context.env.IMAGES.head(filePath);

	if (!image) {
		return new Response('Image not found', { status: 404 });
	}

	await context.env.IMAGES.delete(filePath);

	return new Response('Image deleted', { status: 200 });
}
