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

import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Section,
	Tailwind,
	Text,
} from 'react-email';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Legal from '../components/Legal';
import tailwindConfig from '../tailwind.config';

export type ModerationNoticeKind =
	| 'new_registration'
	| 'ownership_claim'
	| 'car_update'
	| 'photo_upload'
	| 'tip';

export type ModerationNoticeProps = {
	kind: ModerationNoticeKind;
	edition?: string | null;
};

export const MODERATION_NOTICE_COPY: Record<
	ModerationNoticeKind,
	{ title: string; subject: string; summary: string }
> = {
	new_registration: {
		title: 'New registration',
		subject: 'New registration pending',
		summary: 'An owner submitted a new Miata.',
	},
	ownership_claim: {
		title: 'Ownership claim',
		subject: 'Ownership claim pending',
		summary: 'An owner claimed a Miata.',
	},
	car_update: {
		title: 'Car update',
		subject: 'Car update pending',
		summary: 'An owner submitted changes that need review.',
	},
	photo_upload: {
		title: 'Photo upload',
		subject: 'Photo upload pending',
		summary: 'An owner uploaded a new photo.',
	},
	tip: {
		title: 'Tip submission',
		subject: 'Tip pending',
		summary: 'Someone submitted a tip about a limited edition Miata.',
	},
};

export const ModerationNotice = ({ kind, edition }: ModerationNoticeProps) => {
	const copy = MODERATION_NOTICE_COPY[kind];

	return (
		<Html lang="en" dir="ltr">
			<Head>
				<title>{copy.title}</title>
			</Head>

			<Tailwind config={tailwindConfig}>
				<Body className="bg-brg-light font-sans text-brg py-6">
					<Container className="border border-solid border-brg-border rounded-lg">
						<Section className="p-12">
							<Header />

							<Heading as="h2" className="font-medium mb-0">
								{copy.title}
							</Heading>

							<Section>
								<Text>{copy.summary}</Text>

								{edition ? (
									<Text className="font-medium">
										{edition}
									</Text>
								) : null}

								<Button
									href="https://miataregistry.com/moderation"
									className="bg-brg text-white rounded-lg px-5 py-3 mt-4 box-border"
								>
									Open Moderation Panel
								</Button>

								<Text className="text-brg-mid">
									— Miata Registry
								</Text>
							</Section>
						</Section>

						<Footer variant={1} />
					</Container>

					<Legal />
				</Body>
			</Tailwind>
		</Html>
	);
};

export default ModerationNotice;
