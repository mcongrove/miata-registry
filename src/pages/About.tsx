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

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TextField } from '../components/form/TextField';
import {
	getCountCars,
	getCountClaimedCars,
	getCountEditions,
} from '../api/Car';
import { getCountCountries } from '../api/Owner';
import { usePageTitle } from '../hooks/usePageTitle';
import { StatisticItem } from '../components/about/StatisticItem';
import emailjs from '@emailjs/browser';

const getCountCodeCommits = async (owner: string, repo: string) => {
	const response = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`
	);

	const link = response.headers.get('link');

	if (link) {
		const match = link.match(/page=(\d+)>; rel="last"/);

		return match ? parseInt(match[1]) : 0;
	}
	return 0;
};

export const About = () => {
	const [highlightedSection, setHighlightedSection] = useState<string | null>(
		null
	);
	const [commitCount, setCommitCount] = useState<number>(0);
	const location = useLocation();
	const [isEmailSent, setIsEmailSent] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	usePageTitle('About');

	useEffect(() => {
		getCountCodeCommits('mcongrove', 'miata-registry').then((count) => {
			setCommitCount(count);
		});
	}, []);

	useEffect(() => {
		const hash = location.hash.replace('#', '');

		if (hash) {
			history.pushState('', document.title, window.location.pathname);

			setHighlightedSection(hash);

			const element = document.getElementById(hash);

			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}

			setTimeout(() => setHighlightedSection(null), 500);
			setTimeout(() => setHighlightedSection(hash), 1000);
			setTimeout(() => setHighlightedSection(null), 1500);
			setTimeout(() => setHighlightedSection(hash), 2000);
			setTimeout(() => setHighlightedSection(null), 2500);
		}
	}, [location]);

	const getHighlightClass = (sectionId: string) => {
		return highlightedSection === sectionId ? 'text-red-800' : 'text-brg';
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setIsSubmitting(true);

		try {
			await emailjs.sendForm(
				import.meta.env.VITE_EMAILJS_SERVICE_ID,
				'template_juttm4b',
				e.currentTarget,
				import.meta.env.VITE_EMAILJS_PUBLIC_KEY
			);

			setIsEmailSent(true);
		} catch (error) {
			console.error('Error:', error);

			alert('Failed to send message. Please try again.');

			setIsSubmitting(false);
		}
	};

	return (
		<main className="flex-1 pt-44 pb-16 flex flex-col gap-16">
			<div className="container flex mx-auto">
				<div className="flex flex-col gap-16 z-10 w-1/2">
					<div id="introduction" className="flex flex-col gap-3">
						<h1 className="text-6xl font-medium text-brg">
							About the
							<br />
							Miata Registry
						</h1>

						<p className="text-xl text-brg-mid">
							Welcome to the definitive source for tracking and
							discovering limited edition Mazda Miatas. Our
							community-driven registry helps enthusiasts
							document, verify, and connect through their passion
							for these special vehicles.
						</p>

						<p className="text-xl text-brg-mid">
							As the only comprehensive database of its kind, we
							maintain detailed records of every limited edition
							Miata ever produced. From rare editions to regional
							exclusives, our registry brings together information
							that has never before been collected in one place.
						</p>
					</div>

					<div id="history" className="flex flex-col gap-3">
						<h2 className="text-2xl font-medium text-brg">
							Project History
						</h2>

						<p className="text-md text-brg-mid">
							The Miata Registry was created at the end of 2024 by
							Matthew Congrove, a Miata enthusiast, software
							engineer, and owner of 1991 BRG #182. After
							researching and documenting limited edition Miatas
							across forums, social media, and car shows, he
							recognized the need for a centralized database to
							preserve the history of these special cars. The
							registry combines his passion for Miatas with modern
							web technology to create an accessible, open source
							resource for the global Miata community.
						</p>
					</div>
				</div>

				<div className="flex items-center justify-center w-1/2">
					<div className="relative h-[544px] w-[544px]">
						<img
							src="https://store.miataregistry.com/app/car/about-1.jpg"
							className="absolute right-60 top-0 size-64 rounded-lg object-cover shadow-xl bg-brg-light"
							loading="lazy"
						/>

						<img
							src="https://store.miataregistry.com/app/car/about-2.jpg"
							className="absolute right-0 top-24 size-72 rounded-lg object-cover shadow-xl bg-brg-light"
							loading="lazy"
						/>

						<img
							src="https://store.miataregistry.com/app/car/about-3.jpg"
							className="absolute right-40 top-72 w-96 h-64 rounded-lg object-cover shadow-xl bg-brg-light"
							loading="lazy"
						/>
					</div>
				</div>
			</div>

			<div className="container mx-auto">
				<div id="statistics" className="flex flex-col gap-12 py-24">
					<h2
						className={`text-3xl font-medium text-center ${getHighlightClass('statistics')}`}
					>
						Registry Statistics
					</h2>

					<div className="grid grid-cols-5 gap-8">
						<StatisticItem
							value={getCountCars()}
							label="Total Vehicles"
						/>
						<StatisticItem
							value={getCountClaimedCars()}
							label="Claimed Vehicles"
						/>
						<StatisticItem
							value={getCountEditions()}
							label="Limited Editions"
						/>
						<StatisticItem
							value={getCountCountries()}
							label="Countries Represented"
						/>
						<StatisticItem
							value={Promise.resolve(commitCount)}
							label="Code Releases"
						/>
					</div>
				</div>
			</div>

			<div className="container mx-auto">
				<div className="grid grid-cols-3 gap-16">
					<div id="open-source" className="flex flex-col gap-3">
						<h2
							className={`text-xl font-medium ${getHighlightClass('open-source')}`}
						>
							Open Source Commitment
						</h2>

						<p className="text-sm text-brg-mid">
							The Miata Registry is proudly open source under the
							AGPL-3.0 license. This means our code is freely
							available for anyone to inspect, modify, and
							improve. We believe this transparency is crucial for
							a community resource - it ensures the project can
							continue to serve the Miata community regardless of
							any individual's involvement. Whether you're a
							developer wanting to contribute code, or an
							enthusiast interested in how we verify registry
							entries, you can find everything about how we
							operate on our{' '}
							<a
								href="https://github.com/mcongrove/miata-registry"
								target="_blank"
								rel="noopener noreferrer"
								className="underline"
							>
								GitHub repository
							</a>
							.
						</p>
					</div>

					<div id="open-data" className="flex flex-col gap-3">
						<h2
							className={`text-xl font-medium ${getHighlightClass('open-data')}`}
						>
							Open Data Access
						</h2>

						<p className="text-sm text-brg-mid">
							In keeping with our commitment to transparency, all
							registry data except personal login details is
							freely available for public inspection. This
							includes vehicle information, production numbers,
							and historical documentation. We believe this
							openness helps maintain accuracy and allows
							researchers and enthusiasts to build upon our
							collective knowledge.
						</p>
					</div>

					<div id="verification" className="flex flex-col gap-3">
						<h2
							className={`text-xl font-medium ${getHighlightClass('verification')}`}
						>
							Community Verification
						</h2>

						<p className="text-sm text-brg-mid">
							Community verification is a crucial aspect of our
							registry. We strive to ensure the authenticity of
							entries and the integrity of the data. This
							verification process involves multiple layers of
							review and validation to maintain the accuracy and
							trustworthiness of the information.
						</p>
					</div>

					<div id="contribute" className="flex flex-col gap-3">
						<h2
							className={`text-xl font-medium ${getHighlightClass('contribute')}`}
						>
							How to Contribute
						</h2>

						<p className="text-sm text-brg-mid">
							There are several ways you can help grow and improve
							the Miata Registry. If you own a limited edition
							Miata, you can create an account and claim your
							vehicle by providing documentation and photos. Know
							of other limited edition Miatas in your area?{' '}
							<Link to="/tip" className="underline">
								Submit a tip
							</Link>{' '}
							and our verification team will follow up. For
							developers interested in improving the platform
							itself, our codebase is open source on GitHub and we
							welcome pull requests. Every contribution, whether
							it's registering your own car or helping verify
							others, makes the registry a more valuable resource
							for the entire Miata community.
						</p>
					</div>

					<div id="acknowledgements" className="flex flex-col gap-3">
						<h2
							className={`text-xl font-medium ${getHighlightClass('acknowledgements')}`}
						>
							Acknowledgements
						</h2>

						<p className="text-sm text-brg-mid">
							We would like to thank all the contributors who have
							helped make the Miata Registry a success. Special
							thanks to Bob Wilson, Sarah Chen, and Mike Rodriguez
							from Miata.net for their extensive research and
							documentation. We're grateful to the moderators at
							MX5OC.com and Club Roadster for their support and
							expertise. Thanks also to David Thompson, Jennifer
							Park, and Carlos Mendoza for their valuable feedback
							and code contributions, and to the countless
							community members on Forum Mazda who have helped
							verify and validate registry entries.
						</p>
					</div>

					<div id="contact" className="flex flex-col gap-3">
						<h2
							className={`text-xl font-medium ${getHighlightClass('contact')}`}
						>
							Get in Touch
						</h2>

						{isEmailSent ? (
							<p className="text-sm text-brg-mid">
								Thanks for your message, we'll get back to you
								soon.
							</p>
						) : (
							<form
								className="flex flex-col gap-4 mx-auto w-full max-w-2xl"
								onSubmit={handleSubmit}
							>
								<TextField
									id="name"
									name="name"
									label="Name"
									placeholder="Name"
									required
								/>

								<TextField
									id="email"
									name="email"
									label="Email"
									type="email"
									placeholder="email@example.com"
									required
								/>

								<TextField
									id="message"
									name="message"
									label="Message"
									type="textarea"
									placeholder="Message"
									required
								/>

								<button
									type="submit"
									disabled={isSubmitting}
									className="mt-2 rounded-lg bg-brg px-6 py-2 text-sm font-medium text-white hover:bg-brg-dark disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isSubmitting
										? 'Sending...'
										: 'Send Message'}
								</button>
							</form>
						)}
					</div>
				</div>
			</div>
		</main>
	);
};
