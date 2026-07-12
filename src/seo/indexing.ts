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

export const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isValidUuid = (id: string): boolean => UUID_REGEX.test(id);

const BOT_USER_AGENT_PATTERNS = [
	/googlebot/i,
	/bingbot/i,
	/slurp/i,
	/duckduckbot/i,
	/baiduspider/i,
	/yandexbot/i,
	/facebookexternalhit/i,
	/twitterbot/i,
	/slackbot/i,
	/linkedinbot/i,
	/discordbot/i,
	/whatsapp/i,
	/telegrambot/i,
	/gptbot/i,
	/chatgpt-user/i,
	/claudebot/i,
	/claude-web/i,
	/perplexitybot/i,
	/anthropic-ai/i,
	/cohere-ai/i,
	/applebot/i,
	/semrushbot/i,
	/ahrefsbot/i,
];

export const isBotUserAgent = (ua: string): boolean =>
	BOT_USER_AGENT_PATTERNS.some((pattern) => pattern.test(ua));

export type CarIndexableFields = {
	current_owner_id?: string | null;
	story?: string | null;
	owner_history?: unknown[];
	owner_history_count?: number;
	vin?: string | null;
	mileage?: number | null;
	hasPhoto?: boolean;
};

export const isCarIndexable = (car: CarIndexableFields): boolean => {
	if (!car.current_owner_id) {
		return false;
	}

	const hasStory = Boolean(car.story?.trim());
	const ownerHistoryCount =
		car.owner_history_count ?? car.owner_history?.length ?? 0;
	const hasOwnerHistory = ownerHistoryCount > 0;
	const hasPhoto = car.hasPhoto === true;
	const hasSubstantive =
		Boolean(car.vin?.trim()) || car.mileage != null;

	return hasStory || hasOwnerHistory || hasPhoto || hasSubstantive;
};

export const CAR_PHOTO_CDN_BASE = 'https://store.miataregistry.com/car';

export const carPhotoUrl = (carId: string): string =>
	`${CAR_PHOTO_CDN_BASE}/${carId}.jpg`;

export const carHasPhotoAtCdn = async (carId: string): Promise<boolean> => {
	try {
		const response = await fetch(carPhotoUrl(carId), { method: 'HEAD' });

		return response.ok;
	} catch {
		return false;
	}
};
