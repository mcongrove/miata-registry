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

import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Section,
	Tailwind,
	Text,
} from '@react-email/components';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Legal from '../components/Legal';
import tailwindConfig from '../tailwind.config';

export const Welcome = () => {
	return (
		<Html lang="en" dir="ltr">
			<Head>
				<title>Welcome to Miata Registry!</title>
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
					rel="stylesheet"
				/>
			</Head>

			<Preview>
				Thanks for joining the Miata Registry community. Together, we're
				preserving Miata history.
			</Preview>

			<Tailwind config={tailwindConfig}>
				<Body className="bg-brg-light font-sans text-brg py-6">
					<Container className="border border-solid border-brg-border rounded-lg">
						<Section className="p-12">
							<Header />

							<Heading as="h2" className="font-medium mb-0">
								Welcome to the Miata Registry community!
							</Heading>

							<Section>
								<Text>
									We're excited to have you as part of our
									community dedicated to documenting and
									preserving the history of limited edition
									Miatas.
								</Text>

								<Text>
									Whether you own a limited edition Miata or
									simply share our passion for these special
									cars, you're now part of a growing network
									of enthusiasts helping to preserve
									automotive history.
								</Text>

								<Text>Here's what you can do next:</Text>
								<Text className="!my-2 leading-none">
									• Browse our registry of documented limited
									editions
								</Text>
								<Text className="!my-2 leading-none">
									• Register your own limited edition Miata
								</Text>
								<Text className="!my-2 leading-none">
									• Help us identify and document rare
									editions
								</Text>

								<Text>
									If you have any questions or need
									assistance, don't hesitate to reach out to
									our team at{' '}
									<Link
										href="mailto:support@miataregistry.com"
										className="text-brg underline"
									>
										support@miataregistry.com
									</Link>
								</Text>

								<Text>Welcome aboard!</Text>

								<Text className="text-brg-mid">
									— The Miata Registry Team
								</Text>
							</Section>
						</Section>

						<Footer variant={2} />
					</Container>

					<Legal />
				</Body>
			</Tailwind>
		</Html>
	);
};

export default Welcome;
