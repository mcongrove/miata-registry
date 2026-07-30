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

import { Resend } from 'resend';
import ModerationNotice, {
	MODERATION_NOTICE_COPY,
	type ModerationNoticeProps,
} from '../../emails/templates/ModerationNotice';
import { renderEmail } from './renderEmail';

const MODERATOR_EMAIL = 'mattcongrove@gmail.com';

export async function notifyModerator(
	resendApiKey: string,
	props: ModerationNoticeProps
) {
	const copy = MODERATION_NOTICE_COPY[props.kind];
	const resend = new Resend(resendApiKey);

	await resend.emails.send({
		from: 'Miata Registry <support@miataregistry.com>',
		to: MODERATOR_EMAIL,
		subject: `Miata Registry: ${copy.subject}`,
		html: await renderEmail(ModerationNotice(props)),
	});
}

export function formatEditionLabel(
	year?: number | null,
	name?: string | null
): string | null {
	if (year == null && !name) return null;
	if (year != null && name) return `${year} ${name}`;

	return name ?? String(year);
}
