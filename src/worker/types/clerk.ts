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

interface BaseClerkWebhookPayload {
	type: string;
	data: {
		id: string;
	};
}

export interface UserCreatedPayload extends BaseClerkWebhookPayload {
	type: 'user.created';
	data: {
		id: string;
		email_addresses: {
			email_address: string;
			id: string;
		}[];
		primary_email_address_id: string;
	};
}

export interface UserUpdatedPayload extends BaseClerkWebhookPayload {
	type: 'user.updated';
	data: {
		id: string;
		first_name: string | null;
		last_name: string | null;
	};
}

export type ClerkWebhookPayload = UserCreatedPayload | UserUpdatedPayload;
