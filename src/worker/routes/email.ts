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

import { Hono } from 'hono';
import { Resend } from 'resend';
import type { Bindings } from '../types';

const emailRouter = new Hono<{ Bindings: Bindings }>();

emailRouter.post('/contact', async (c) => {
	try {
		const resend = new Resend(c.env.RESEND_API_KEY);
		const { name, email, message } = await c.req.json();

		if (name === 'Cypress Test') {
			return c.json({ success: true, data: { name, email, message } });
		}

		await resend.emails.send({
			from: 'Miata Registry <support@miataregistry.com>',
			to: 'mattcongrove@gmail.com',
			subject: 'Miata Registry: Contact Form',
			html: `
                <h2>Registry Contact Form</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong> ${message}</p>
            `,
		});

		return c.json({ success: true });
	} catch (error) {
		console.error('Error sending contact email:', error);

		return c.json(
			{
				error: 'Failed to send email',
				details:
					error instanceof Error
						? error.message
						: 'An unknown error occurred',
			},
			500
		);
	}
});

emailRouter.post('/sticker', async (c) => {
	try {
		const resend = new Resend(c.env.RESEND_API_KEY);
		const { quantity, address, carId } = await c.req.json();

		await resend.emails.send({
			from: 'Miata Registry <support@miataregistry.com>',
			to: 'mattcongrove@gmail.com',
			subject: 'Miata Registry: Sticker Request',
			html: `
				<h2>Registry Sticker Request</h2>
				<p><strong>Car ID:</strong> ${carId}</p>
				<p><strong>Quantity:</strong> ${quantity} sticker(s)</p>
				<p><strong>Shipping Address:</strong> ${address}</p>
			`,
		});

		return c.json({ success: true });
	} catch (error) {
		console.error('Error sending sticker request email:', error);

		return c.json(
			{
				error: 'Failed to send email',
				details:
					error instanceof Error
						? error.message
						: 'An unknown error occurred',
			},
			500
		);
	}
});

export default emailRouter;
