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

import { and, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { createDb } from '../../db';
import { CarOwners } from '../../db/schema/CarOwners';
import { CarOwnersPending } from '../../db/schema/CarOwnersPending';
import { Cars } from '../../db/schema/Cars';
import { CarsPending } from '../../db/schema/CarsPending';
import { Editions } from '../../db/schema/Editions';
import { Owners } from '../../db/schema/Owners';
import { OwnersPending } from '../../db/schema/OwnersPending';
import { withAuth } from '../middleware/auth';
import { withModerator } from '../middleware/moderator';
import { Bindings } from '../types';
import {
	approvePendingCar,
	approvePendingCarOwner,
	approvePendingOwner,
	approvePendingPackage,
	invalidateCarCaches,
	rejectPendingPackage,
	sendApprovedCarEmail,
	type PackageApproveOverrides,
} from '../utils/moderationApprove';

const moderationRouter = new Hono<{ Bindings: Bindings }>();

moderationRouter.get('/cars', withAuth(), withModerator(), async (c) => {
	try {
		const db = createDb(c.env.DB);

		const pendingChanges = await db
			.select({
				pending: CarsPending,
				edition: sql<string>`${Editions.year} || ' ' || ${Editions.name}`,
			})
			.from(CarsPending)
			.leftJoin(Editions, eq(CarsPending.edition_id, Editions.id))
			.where(eq(CarsPending.status, 'pending'));

		const formattedChanges = await Promise.all(
			pendingChanges.map(async ({ pending, edition }) => {
				const current = await db
					.select()
					.from(Cars)
					.where(eq(Cars.id, pending.car_id))
					.get();

				const {
					created_at,
					id,
					status,
					car_id,
					...proposedWithoutMeta
				} = pending;

				return {
					id,
					car_id,
					created_at,
					status,
					edition,
					current: current || null,
					proposed: { ...proposedWithoutMeta, id: car_id },
				};
			})
		);

		return c.json(formattedChanges);
	} catch (error) {
		console.error('Error fetching pending car changes:', error);

		return c.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error
						? error.message
						: 'An unknown error occurred',
			},
			500
		);
	}
});

moderationRouter.get('/carOwners', withAuth(), withModerator(), async (c) => {
	try {
		const db = createDb(c.env.DB);

		const pendingCarOwners = await db
			.select()
			.from(CarOwnersPending)
			.where(eq(CarOwnersPending.status, 'pending'));

		const formattedChanges = await Promise.all(
			pendingCarOwners.map(async (pending) => {
				const [current, car] = await Promise.all([
					db
						.select()
						.from(CarOwners)
						.where(
							and(
								eq(CarOwners.car_id, pending.car_id),
								eq(CarOwners.owner_id, pending.owner_id)
							)
						)
						.get(),
					db
						.select({
							current_owner_id: Cars.current_owner_id,
						})
						.from(Cars)
						.where(eq(Cars.id, pending.car_id))
						.get(),
				]);

				const { created_at, id, status, ...proposedWithoutMeta } =
					pending;

				return {
					id,
					created_at,
					status,
					car_current_owner_id: car?.current_owner_id ?? null,
					current: current || null,
					proposed: proposedWithoutMeta,
				};
			})
		);

		return c.json(formattedChanges);
	} catch (error) {
		console.error('Error fetching pending car owners:', error);

		return c.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error
						? error.message
						: 'An unknown error occurred',
			},
			500
		);
	}
});

moderationRouter.get('/owners', withAuth(), withModerator(), async (c) => {
	try {
		const db = createDb(c.env.DB);

		const pendingOwners = await db
			.select()
			.from(OwnersPending)
			.where(eq(OwnersPending.status, 'pending'));

		const formattedChanges = await Promise.all(
			pendingOwners.map(async (pending) => {
				const current = await db
					.select()
					.from(Owners)
					.where(eq(Owners.id, pending.id))
					.get();

				const { created_at, id, status, ...proposedWithoutMeta } =
					pending;

				return {
					id,
					created_at,
					status,
					current: current || null,
					proposed: { ...proposedWithoutMeta, id: pending.id },
				};
			})
		);

		return c.json(formattedChanges);
	} catch (error) {
		console.error('Error fetching pending owners:', error);

		return c.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error
						? error.message
						: 'An unknown error occurred',
			},
			500
		);
	}
});

moderationRouter.get('/photo', withAuth(), withModerator(), async (c) => {
	try {
		const pendingPhotos = await c.env.IMAGES.list({
			prefix: 'car-pending/',
		});

		const photos = await Promise.all(
			pendingPhotos.objects.map(async (object) => {
				const id = object.key
					.replace('car-pending/', '')
					.replace('.jpg', '');

				return {
					id,
					uploadedAt: Math.floor(Number(object.uploaded) / 1000),
				};
			})
		);

		return c.json(photos);
	} catch (error) {
		console.error('Error fetching pending photos:', error);

		return c.json(
			{
				error: 'Internal server error',
				details:
					error instanceof Error ? error.message : 'Unknown error',
			},
			500
		);
	}
});

moderationRouter.post(
	'/car/:id/approve',
	withAuth(),
	withModerator(),
	async (c) => {
		const { id } = c.req.param();
		const { skipEmail } = await c.req
			.json<{ skipEmail?: boolean }>()
			.catch(() => ({ skipEmail: false }));

		try {
			const db = createDb(c.env.DB);
			const approved = await approvePendingCar(db, id, c.env.CACHE);

			if (!approved) {
				return c.json({ error: 'Not found' }, 404);
			}

			if (!skipEmail && approved.userId) {
				await sendApprovedCarEmail({
					carId: approved.carId,
					clerk: c.get('clerk'),
					resendApiKey: c.env.RESEND_API_KEY,
					userId: approved.userId,
				});
			}

			return c.json({ success: true });
		} catch (error) {
			console.error('Error approving car:', error);

			return c.json(
				{
					error: 'Internal server error',
					details:
						error instanceof Error
							? error.message
							: 'An unknown error occurred',
				},
				500
			);
		}
	}
);

moderationRouter.post(
	'/package/:id/approve',
	withAuth(),
	withModerator(),
	async (c) => {
		const { id } = c.req.param();
		const { skipEmail, overrides } = await c.req
			.json<{
				skipEmail?: boolean;
				overrides?: PackageApproveOverrides;
			}>()
			.catch(() => ({
				skipEmail: false,
				overrides: undefined as PackageApproveOverrides | undefined,
			}));

		try {
			const db = createDb(c.env.DB);
			const approved = await approvePendingPackage(
				db,
				id,
				c.env.CACHE,
				overrides
			);

			if (!approved) {
				return c.json({ error: 'Not found' }, 404);
			}

			if (!skipEmail && approved.userId) {
				await sendApprovedCarEmail({
					carId: approved.carId,
					clerk: c.get('clerk'),
					resendApiKey: c.env.RESEND_API_KEY,
					userId: approved.userId,
				});
			}

			return c.json({ success: true });
		} catch (error) {
			console.error('Error approving package:', error);

			return c.json(
				{
					error: 'Internal server error',
					details:
						error instanceof Error
							? error.message
							: 'An unknown error occurred',
				},
				500
			);
		}
	}
);

moderationRouter.post(
	'/carOwner/:id/approve',
	withAuth(),
	withModerator(),
	async (c) => {
		const { id } = c.req.param();

		try {
			const db = createDb(c.env.DB);
			const approved = await approvePendingCarOwner(db, id, c.env.CACHE);

			if (!approved) {
				return c.json({ error: 'Not found' }, 404);
			}

			return c.json({ success: true });
		} catch (error) {
			console.error('Error approving car owner:', error);

			return c.json(
				{
					error: 'Internal server error',
					details:
						error instanceof Error
							? error.message
							: 'An unknown error occurred',
				},
				500
			);
		}
	}
);

moderationRouter.post(
	'/owner/:id/approve',
	withAuth(),
	withModerator(),
	async (c) => {
		const { id } = c.req.param();

		try {
			const db = createDb(c.env.DB);
			const approved = await approvePendingOwner(db, id);

			if (!approved) {
				return c.json({ error: 'Not found' }, 404);
			}

			return c.json({ success: true });
		} catch (error) {
			console.error('Error approving owner:', error);

			return c.json(
				{
					error: 'Internal server error',
					details:
						error instanceof Error
							? error.message
							: 'An unknown error occurred',
				},
				500
			);
		}
	}
);

moderationRouter.post(
	'/photo/:id/approve',
	withAuth(),
	withModerator(),
	async (c) => {
		const { id } = c.req.param();
		const { skipEmail } = await c.req
			.json<{ skipEmail?: boolean }>()
			.catch(() => ({ skipEmail: false }));

		try {
			const pendingPhoto = await c.env.IMAGES.get(
				`car-pending/${id}.jpg`
			);

			if (!pendingPhoto) {
				return c.json({ error: 'Not found' }, 404);
			}

			await c.env.IMAGES.put(
				`car/${id}.jpg`,
				await pendingPhoto.arrayBuffer(),
				{
					httpMetadata: {
						contentType: 'image/jpeg',
						cacheControl: 'public, max-age=31536000',
					},
				}
			);

			await c.env.IMAGES.delete(`car-pending/${id}.jpg`);
			await invalidateCarCaches(c.env.CACHE, id, {
				editionsAndStats: false,
			});

			if (!skipEmail) {
				const db = createDb(c.env.DB);
				const owner = await db
					.select({ user_id: Owners.user_id })
					.from(Cars)
					.leftJoin(Owners, eq(Cars.current_owner_id, Owners.id))
					.where(eq(Cars.id, id))
					.get();

				if (owner?.user_id) {
					await sendApprovedCarEmail({
						carId: id,
						clerk: c.get('clerk'),
						resendApiKey: c.env.RESEND_API_KEY,
						userId: owner.user_id,
					});
				}
			}

			return c.json({ success: true });
		} catch (error) {
			console.error('Error approving photo:', error);

			return c.json(
				{
					error: 'Internal server error',
					details:
						error instanceof Error
							? error.message
							: 'Unknown error',
				},
				500
			);
		}
	}
);

moderationRouter.post(
	'/car/:id/reject',
	withAuth(),
	withModerator(),
	async (c) => {
		const { id } = c.req.param();

		try {
			const db = createDb(c.env.DB);

			const pendingCar = await db
				.select({ car_id: CarsPending.car_id })
				.from(CarsPending)
				.where(eq(CarsPending.id, id))
				.get();

			await db
				.update(CarsPending)
				.set({ status: 'rejected' })
				.where(eq(CarsPending.id, id));

			if (pendingCar?.car_id) {
				await invalidateCarCaches(c.env.CACHE, pendingCar.car_id, {
					editionsAndStats: false,
				});
			}

			return c.json({ success: true });
		} catch (error) {
			console.error('Error rejecting car:', error);

			return c.json(
				{
					error: 'Internal server error',
					details:
						error instanceof Error
							? error.message
							: 'An unknown error occurred',
				},
				500
			);
		}
	}
);

moderationRouter.post(
	'/package/:id/reject',
	withAuth(),
	withModerator(),
	async (c) => {
		const { id } = c.req.param();

		try {
			const db = createDb(c.env.DB);
			const rejected = await rejectPendingPackage(db, id, c.env.CACHE);

			if (!rejected) {
				return c.json({ error: 'Not found' }, 404);
			}

			return c.json({ success: true });
		} catch (error) {
			console.error('Error rejecting package:', error);

			return c.json(
				{
					error: 'Internal server error',
					details:
						error instanceof Error
							? error.message
							: 'An unknown error occurred',
				},
				500
			);
		}
	}
);

moderationRouter.post(
	'/carOwner/:id/reject',
	withAuth(),
	withModerator(),
	async (c) => {
		const { id } = c.req.param();

		try {
			const db = createDb(c.env.DB);

			const pendingCarOwner = await db
				.select({ car_id: CarOwnersPending.car_id })
				.from(CarOwnersPending)
				.where(eq(CarOwnersPending.id, id))
				.get();

			await db
				.update(CarOwnersPending)
				.set({ status: 'rejected' })
				.where(eq(CarOwnersPending.id, id));

			if (pendingCarOwner?.car_id) {
				await invalidateCarCaches(c.env.CACHE, pendingCarOwner.car_id, {
					editionsAndStats: false,
				});
			}

			return c.json({ success: true });
		} catch (error) {
			console.error('Error rejecting car owner:', error);

			return c.json(
				{
					error: 'Internal server error',
					details:
						error instanceof Error
							? error.message
							: 'An unknown error occurred',
				},
				500
			);
		}
	}
);

moderationRouter.post(
	'/owner/:id/reject',
	withAuth(),
	withModerator(),
	async (c) => {
		const { id } = c.req.param();

		try {
			const db = createDb(c.env.DB);

			await db
				.update(OwnersPending)
				.set({ status: 'rejected' })
				.where(eq(OwnersPending.id, id));

			return c.json({ success: true });
		} catch (error) {
			console.error('Error rejecting owner:', error);

			return c.json(
				{
					error: 'Internal server error',
					details:
						error instanceof Error
							? error.message
							: 'An unknown error occurred',
				},
				500
			);
		}
	}
);

moderationRouter.post(
	'/photo/:id/reject',
	withAuth(),
	withModerator(),
	async (c) => {
		const { id } = c.req.param();

		try {
			await c.env.IMAGES.delete(`car-pending/${id}.jpg`);

			return c.json({ success: true });
		} catch (error) {
			console.error('Error rejecting photo:', error);

			return c.json(
				{
					error: 'Internal server error',
					details:
						error instanceof Error
							? error.message
							: 'Unknown error',
				},
				500
			);
		}
	}
);

export default moderationRouter;
