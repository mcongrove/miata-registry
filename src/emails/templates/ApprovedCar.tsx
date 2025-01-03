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
	Section,
	Tailwind,
	Text,
} from '@react-email/components';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Legal from '../components/Legal';
import tailwindConfig from '../tailwind.config';

export const ApprovedCar = () => {
	return (
		<Html lang="en" dir="ltr">
			<Head>
				<title>Car information changes approved</title>
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
					rel="stylesheet"
				/>
			</Head>

			{/* <Preview>Your recently submitted car information changes have been approved.</Preview> */}

			<Tailwind config={tailwindConfig}>
				<Body className="bg-white font-sans text-brg py-6">
					<Container className="border border-solid border-brg-light rounded-lg">
						<Section className="p-12">
							<Header />

							<Heading as="h2" className="font-medium mb-0">
								Car information changes approved
							</Heading>

							<Section>
								<Text>
									Your recently submitted changes to your
									car's information have been reviewed and
									approved by our team.
								</Text>

								<Text>
									These updates are now live in our registry.
									Thank you for helping us maintain accurate
									records of limited edition Miatas.
								</Text>

								<Text>
									If you have any questions about the changes
									or need to make additional updates, please
									don't hesitate to reach out to our team at{' '}
									<Link
										href="mailto:support@miataregistry.com"
										className="text-brg underline"
									>
										support@miataregistry.com
									</Link>
								</Text>

								<Text className="text-brg-mid">
									— The Miata Registry Team
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

export default ApprovedCar;
