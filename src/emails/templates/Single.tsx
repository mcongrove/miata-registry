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
	Section,
	Tailwind,
	Text,
} from '@react-email/components';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Legal from '../components/Legal';
import tailwindConfig from '../tailwind.config';

type SingleEmailProps = {
	subject?: string;
	message?: string;
};

export const Single = ({
	subject = 'Miata Registry',
	message = 'This is a test email.',
}: SingleEmailProps) => {
	const formattedMessage = message
		.split('\n')
		.map((line, i) => <Text key={i}>{line}</Text>);

	return (
		<Html lang="en" dir="ltr">
			<Head>
				<title>{subject}</title>
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
					rel="stylesheet"
				/>
			</Head>

			<Tailwind config={tailwindConfig}>
				<Body className="bg-brg-light font-sans text-brg py-6">
					<Container className="border border-solid border-brg-border rounded-lg">
						<Section className="p-12">
							<Header />

							<Heading as="h2" className="font-medium mb-0">
								{subject}
							</Heading>

							<Section>
								{formattedMessage}

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

export default Single;
