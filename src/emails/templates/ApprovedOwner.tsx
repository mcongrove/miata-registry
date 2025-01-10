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

export const ApprovedOwner = ({ car_id }: { car_id?: string }) => {
	const link = car_id ? `https://miataregistry.com/registry/${car_id}` : null;

	return (
		<Html lang="en" dir="ltr">
			<Head>
				<title>Ownership changes approved</title>
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
					rel="stylesheet"
				/>
			</Head>

			{/* <Preview>Your recently submitted ownership changes have been approved.</Preview> */}

			<Tailwind config={tailwindConfig}>
				<Body className="bg-brg-light font-sans text-brg py-6">
					<Container className="border border-solid border-brg-border rounded-lg">
						<Section className="p-12">
							<Header />

							<Heading as="h2" className="font-medium mb-0">
								Ownership changes approved
							</Heading>

							<Section>
								<Text>
									Your recently submitted changes to your
									car's ownership information have been
									reviewed and approved by our team.
								</Text>

								{link ? (
									<>
										<Text>
											These updates are now live in our
											registry at{' '}
											<Link href={link}>{link}</Link>
										</Text>

										<Text>
											Thank you for helping us maintain
											accurate records of limited edition
											Miatas.
										</Text>
									</>
								) : (
									<Text>
										These updates are now live in our
										registry. Thank you for helping us
										maintain accurate records of limited
										edition Miatas.
									</Text>
								)}

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

export default ApprovedOwner;

ApprovedOwner.PreviewProps = {
	car_id: 'test123',
};
