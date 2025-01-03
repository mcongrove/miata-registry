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

import { Container, Img, Link, Section, Text } from '@react-email/components';

export default function Legal() {
	return (
		<Container className="mt-6">
			<Section className="text-center mb-4">
				<Link
					className="text-xs text-center text-brg underline"
					href="https://miataregistry.com"
				>
					MiataRegistry.com
				</Link>
			</Section>

			<Section className="text-center">
				<Link href="https://www.instagram.com/miataregistry/">
					<Img
						src="https://store.miataregistry.com/app/email/instagram.png"
						width={24}
						height={24}
						alt="Instagram"
						className="inline mr-4"
					/>
				</Link>

				<Link href="https://github.com/mcongrove/miata-registry">
					<Img
						src="https://store.miataregistry.com/app/email/github.png"
						width={24}
						height={24}
						alt="GitHub"
						className="inline"
					/>
				</Link>
			</Section>

			<Text className="text-xs text-brg-border text-center">
				This is a transactional email sent in response to your request
				with Miata Registry. As it contains important information about
				your account, it cannot be unsubscribed from. For questions
				about your account, please contact{' '}
				<Link
					href="mailto:support@miataregistry.com"
					className="text-brg-border underline"
				>
					support@miataregistry.com
				</Link>
			</Text>

			<Text className="text-xs text-brg-border text-center">
				To report suspicious emails claiming to be from Miata Registry,
				please forward them to{' '}
				<Link
					href="mailto:security@miataregistry.com"
					className="text-brg-border underline"
				>
					support@miataregistry.com
				</Link>
			</Text>

			<Text className="text-xs text-brg-border text-center">
				© {new Date().getFullYear()} Matthew Congrove. All rights
				reserved.{' '}
				<Link
					href="https://miataregistry.com/legal"
					className="text-brg-border underline"
				>
					Legal Terms
				</Link>
			</Text>
		</Container>
	);
}
