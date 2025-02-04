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

import { and, count, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { Resend } from 'resend';
import { createDb } from '../../db';
import { CarOwners } from '../../db/schema/CarOwners';
import { CarOwnersPending } from '../../db/schema/CarOwnersPending';
import { Cars } from '../../db/schema/Cars';
import { CarsPending } from '../../db/schema/CarsPending';
import { Editions } from '../../db/schema/Editions';
import { Owners } from '../../db/schema/Owners';
import { OwnersPending } from '../../db/schema/OwnersPending';
import { Tips } from '../../db/schema/Tips';
import ApprovedCar from '../../emails/templates/ApprovedCar';
import ApprovedOwner from '../../emails/templates/ApprovedOwner';
import { TModerationStats } from '../../types/Common';
import { withAuth } from '../middleware/auth';
import { Bindings } from '../types';

const moderationRouter = new Hono<{ Bindings: Bindings }>();

const withModerator = () => async (c: any, next: any) => {
	const isModerator = await c
		.get('clerk')
		.users.getUser(c.get('userId'))
		.then((user: any) => user.publicMetadata?.moderator);

	if (!isModerator) {
		return c.json({ error: 'Unauthorized' }, 403);
	}

	await next();
};

moderationRouter.get('/cars', withAuth(), withModerator(), async (c) => {
	try {
		const db = createDb(c.env.DB);

		const pendingChanges = await db
			.select({
				car_id: CarsPending.car_id,
				created_at: CarsPending.created_at,
				current_owner_id: CarsPending.current_owner_id,
				destroyed: CarsPending.destroyed,
				edition_id: CarsPending.edition_id,
				id: CarsPending.id,
				manufacture_date: CarsPending.manufacture_date,
				sale_date: CarsPending.sale_date,
				sale_dealer_city: CarsPending.sale_dealer_city,
				sale_dealer_country: CarsPending.sale_dealer_country,
				sale_dealer_name: CarsPending.sale_dealer_name,
				sale_dealer_state: CarsPending.sale_dealer_state,
				sale_msrp: CarsPending.sale_msrp,
				sequence: CarsPending.sequence,
				shipping_city: CarsPending.shipping_city,
				shipping_country: CarsPending.shipping_country,
				shipping_date: CarsPending.shipping_date,
				shipping_state: CarsPending.shipping_state,
				shipping_vessel: CarsPending.shipping_vessel,
				status: CarsPending.status,
				vin: CarsPending.vin,
				edition: sql<string>`${Editions.year} || ' ' || ${Editions.name}`,
			})
			.from(CarsPending)
			.leftJoin(Editions, eq(CarsPending.edition_id, Editions.id))
			.where(eq(CarsPending.status, 'pending'));

		const formattedChanges = await Promise.all(
			pendingChanges.map(async (pending) => {
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
					edition,
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
				const current = await db
					.select()
					.from(CarOwners)
					.where(
						and(
							eq(CarOwners.car_id, pending.car_id),
							eq(CarOwners.owner_id, pending.owner_id)
						)
					)
					.get();

				const { created_at, id, status, ...proposedWithoutMeta } =
					pending;

				return {
					id,
					created_at,
					status,
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

			const pendingCar = await db
				.select({
					car_id: CarsPending.car_id,
					created_at: CarsPending.created_at,
					current_owner_id: CarsPending.current_owner_id,
					destroyed: CarsPending.destroyed,
					edition_id: CarsPending.edition_id,
					id: CarsPending.id,
					manufacture_date: CarsPending.manufacture_date,
					sale_date: CarsPending.sale_date,
					sale_dealer_city: CarsPending.sale_dealer_city,
					sale_dealer_country: CarsPending.sale_dealer_country,
					sale_dealer_name: CarsPending.sale_dealer_name,
					sale_dealer_state: CarsPending.sale_dealer_state,
					sale_msrp: CarsPending.sale_msrp,
					sequence: CarsPending.sequence,
					shipping_city: CarsPending.shipping_city,
					shipping_country: CarsPending.shipping_country,
					shipping_date: CarsPending.shipping_date,
					shipping_state: CarsPending.shipping_state,
					shipping_vessel: CarsPending.shipping_vessel,
					status: CarsPending.status,
					vin: CarsPending.vin,
					user_id: Owners.user_id,
				})
				.from(CarsPending)
				.leftJoin(Owners, eq(CarsPending.current_owner_id, Owners.id))
				.where(eq(CarsPending.id, id))
				.get();

			if (!pendingCar) {
				return c.json({ error: 'Not found' }, 404);
			}

			const {
				created_at,
				id: pendingId,
				status,
				car_id,
				user_id,
				...carData
			} = pendingCar;

			await db
				.insert(Cars)
				.values({ id: car_id, ...carData })
				.onConflictDoUpdate({
					target: Cars.id,
					set: carData,
				});

			await db
				.update(CarsPending)
				.set({ status: 'approved' })
				.where(eq(CarsPending.id, id));

			await c.env.CACHE.delete(`cars:details:${car_id}`);
			await c.env.CACHE.delete(`cars:summary:${car_id}`);
			await c.env.CACHE.delete('editions:all');
			await c.env.CACHE.delete('stats:all');

			if (user_id) {
				const requestingUser = await c
					.get('clerk')
					.users.getUser(user_id);

				if (!skipEmail) {
					const primaryEmail = requestingUser.emailAddresses.find(
						(email) =>
							email.id === requestingUser.primaryEmailAddressId
					);

					if (primaryEmail) {
						const resend = new Resend(c.env.RESEND_API_KEY);

						await resend.emails.send({
							from: 'Miata Registry <no-reply@miataregistry.com>',
							to: primaryEmail.emailAddress,
							subject: 'Miata Registry: Car update approved',
							react: ApprovedCar({
								car_id,
							}),
						});
					}
				}
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
	'/carOwner/:id/approve',
	withAuth(),
	withModerator(),
	async (c) => {
		const { id } = c.req.param();
		const { skipEmail } = await c.req
			.json<{ skipEmail?: boolean }>()
			.catch(() => ({ skipEmail: false }));

		try {
			const db = createDb(c.env.DB);

			const pendingCarOwner = await db
				.select({
					car_id: CarOwnersPending.car_id,
					created_at: CarOwnersPending.created_at,
					date_end: CarOwnersPending.date_end,
					date_start: CarOwnersPending.date_start,
					id: CarOwnersPending.id,
					information: CarOwnersPending.information,
					owner_id: CarOwnersPending.owner_id,
					status: CarOwnersPending.status,
					user_id: Owners.user_id,
				})
				.from(CarOwnersPending)
				.leftJoin(Owners, eq(CarOwnersPending.owner_id, Owners.id))
				.where(eq(CarOwnersPending.id, id))
				.get();

			if (!pendingCarOwner) {
				return c.json({ error: 'Not found' }, 404);
			}

			const {
				created_at,
				id: pendingId,
				information,
				status,
				user_id,
				...carOwnerData
			} = pendingCarOwner;

			const existingCarOwner = await db
				.select()
				.from(CarOwners)
				.where(
					and(
						eq(CarOwners.car_id, pendingCarOwner.car_id),
						eq(CarOwners.owner_id, pendingCarOwner.owner_id)
					)
				)
				.get();

			if (existingCarOwner) {
				await db
					.update(CarOwners)
					.set(carOwnerData)
					.where(
						and(
							eq(CarOwners.car_id, pendingCarOwner.car_id),
							eq(CarOwners.owner_id, pendingCarOwner.owner_id)
						)
					);
			} else {
				await db
					.update(CarOwners)
					.set({ date_end: pendingCarOwner.date_start })
					.where(
						and(
							eq(CarOwners.car_id, pendingCarOwner.car_id),
							sql`${CarOwners.date_end} IS NULL`
						)
					);

				await db.insert(CarOwners).values(carOwnerData);

				await db
					.update(Cars)
					.set({ current_owner_id: pendingCarOwner.owner_id })
					.where(eq(Cars.id, pendingCarOwner.car_id));
			}

			await db
				.update(CarOwnersPending)
				.set({ status: 'approved' })
				.where(eq(CarOwnersPending.id, id));

			await c.env.CACHE.delete(`cars:details:${pendingCarOwner.car_id}`);
			await c.env.CACHE.delete(`cars:summary:${pendingCarOwner.car_id}`);
			await c.env.CACHE.delete('editions:all');
			await c.env.CACHE.delete('stats:all');

			if (user_id) {
				const requestingUser = await c
					.get('clerk')
					.users.getUser(user_id);

				if (!skipEmail) {
					const primaryEmail = requestingUser.emailAddresses.find(
						(email) =>
							email.id === requestingUser.primaryEmailAddressId
					);

					if (primaryEmail) {
						const resend = new Resend(c.env.RESEND_API_KEY);

						await resend.emails.send({
							from: 'Miata Registry <no-reply@miataregistry.com>',
							to: primaryEmail.emailAddress,
							subject:
								'Miata Registry: Ownership update approved',
							react: ApprovedOwner({
								car_id: pendingCarOwner.car_id,
							}),
						});
					}
				}
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

			const pendingOwner = await db
				.select()
				.from(OwnersPending)
				.where(eq(OwnersPending.id, id))
				.get();

			if (!pendingOwner) {
				return c.json({ error: 'Not found' }, 404);
			}

			const { created_at, status, ...ownerData } = pendingOwner;

			await db.insert(Owners).values(ownerData);

			await db
				.update(OwnersPending)
				.set({ status: 'approved' })
				.where(eq(OwnersPending.id, id));

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

			await db
				.update(CarsPending)
				.set({ status: 'rejected' })
				.where(eq(CarsPending.id, id));

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
	'/carOwner/:id/reject',
	withAuth(),
	withModerator(),
	async (c) => {
		const { id } = c.req.param();

		try {
			const db = createDb(c.env.DB);

			await db
				.update(CarOwnersPending)
				.set({ status: 'rejected' })
				.where(eq(CarOwnersPending.id, id));

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

moderationRouter.get('/stats', async (c) => {
	try {
		const db = createDb(c.env.DB);

		const carStats = await db
			.select({ status: CarsPending.status, count: count() })
			.from(CarsPending)
			.groupBy(CarsPending.status);

		const carOwnerStats = await db
			.select({ status: CarOwnersPending.status, count: count() })
			.from(CarOwnersPending)
			.groupBy(CarOwnersPending.status);

		const ownerStats = await db
			.select({ status: OwnersPending.status, count: count() })
			.from(OwnersPending)
			.groupBy(OwnersPending.status);

		const tipsStats = await db
			.select({ status: Tips.status, count: count() })
			.from(Tips)
			.groupBy(Tips.status);

		const stats: TModerationStats = {
			pending:
				Number(
					carStats.find((s) => s.status === 'pending')?.count || 0
				) +
				Number(
					carOwnerStats.find((s) => s.status === 'pending')?.count ||
						0
				) +
				Number(
					ownerStats.find((s) => s.status === 'pending')?.count || 0
				) +
				Number(
					tipsStats.find((s) => s.status === 'pending')?.count || 0
				),
			approved:
				Number(
					carStats.find((s) => s.status === 'approved')?.count || 0
				) +
				Number(
					carOwnerStats.find((s) => s.status === 'approved')?.count ||
						0
				) +
				Number(
					ownerStats.find((s) => s.status === 'approved')?.count || 0
				) +
				Number(
					tipsStats.find((s) => s.status === 'approved')?.count || 0
				),
			rejected:
				Number(
					carStats.find((s) => s.status === 'rejected')?.count || 0
				) +
				Number(
					carOwnerStats.find((s) => s.status === 'rejected')?.count ||
						0
				) +
				Number(
					ownerStats.find((s) => s.status === 'rejected')?.count || 0
				) +
				Number(
					tipsStats.find((s) => s.status === 'rejected')?.count || 0
				),
		};

		return c.json(stats);
	} catch (error) {
		console.error('Error fetching moderation statistics:', error);

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

export default moderationRouter;
