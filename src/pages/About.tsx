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

import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StatisticItem } from '../components/about/StatisticItem';
import { Button } from '../components/Button';
import { ErrorBanner } from '../components/ErrorBanner';
import { Field } from '../components/form/Field';
import { TextField } from '../components/form/TextField';
import { useModal } from '../context/ModalContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { handleApiError } from '../utils/common';

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
	const { isSignedIn } = useAuth();
	const { openModal } = useModal();
	const [highlightedSection, setHighlightedSection] = useState<string | null>(
		null
	);
	const [commitCount, setCommitCount] = useState<number>(0);
	const location = useLocation();
	const [isEmailSent, setIsEmailSent] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [stats, setStats] = useState<{
		cars: number;
		claimedCars: number;
		editions: number;
		countries: number;
	} | null>(null);

	usePageMeta({
		path: '/about',
		title: 'About',
		description:
			'About the Miata Registry, a community-driven project documenting the history of limited edition Mazda Miatas.',
	});

	useEffect(() => {
		Promise.all([
			fetch(`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/stats`).then(
				(res) => res.json()
			),
			getCountCodeCommits('mcongrove', 'miata-registry'),
		]).then(([statsData, commits]) => {
			setStats(statsData);
			setCommitCount(commits);
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
			const formData = new FormData(e.currentTarget);

			const response = await fetch(
				`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/email/contact`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: formData.get('name'),
						email: formData.get('email'),
						message: formData.get('message'),
					}),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to send message');
			}

			setIsEmailSent(true);
		} catch (error) {
			handleApiError(error);
			setFormError('Failed to submit form. Please try again.');
			setIsSubmitting(false);
		}
	};

	return (
		<main className="flex-1 px-8 pt-28 lg:pt-40 lg:px-0 pb-16 flex flex-col gap-16">
			<div className="container mx-auto flex flex-col gap-12 lg:gap-0 lg:flex-row">
				<div className="flex flex-col gap-8 lg:gap-16 z-10 lg:w-1/2">
					<div id="introduction" className="flex flex-col gap-4">
						<h1 className="text-4xl lg:text-6xl font-medium text-brg">
							About the
							<br />
							Miata Registry
						</h1>

						<p className="text-md lg:text-xl text-brg-mid">
							Welcome to the definitive source for tracking and
							discovering limited edition Mazda Miatas. Our
							community-driven registry helps enthusiasts
							document, verify, and connect through their passion
							for these special vehicles.
						</p>

						<p className="text-md lg:text-xl text-brg-mid">
							As the only comprehensive database of its kind, we
							aim to maintain detailed records of every limited
							edition Miata ever produced. From rare editions to
							regional exclusives, our registry brings together
							information that has never before been collected in
							one place.
						</p>
					</div>

					<div id="history" className="flex flex-col gap-3">
						<h2 className="text-2xl font-medium text-brg">
							Project History
						</h2>

						<p className="text-sm lg:text-md text-brg-mid">
							The Miata Registry was created at the end of 2024 by
							Matthew Congrove, a Miata enthusiast, software
							engineer, and owner of{' '}
							<Link
								to="/registry/63621393-a540-46b5-b9fe-9231fea2730f"
								className="underline"
							>
								1991 BRG #182
							</Link>
							. After researching and finding limited edition
							Miatas across forums, social media, and car shows,
							he recognized the need for a centralized database to
							preserve the history of these special cars. The
							registry combines his passion for Miatas with modern
							web technology to create an accessible, open source
							resource for the global Miata community.
						</p>
					</div>
				</div>

				<div className="flex items-center justify-center lg:w-1/2">
					<div className="relative w-full h-[374px] lg:w-[544px] lg:h-[544px]">
						<img
							src="https://store.miataregistry.com/app/car/about-1.jpg"
							className="absolute max-lg:left-1/4 top-0 size-48 lg:right-60 lg:top-0 lg:size-64 rounded-lg object-cover shadow-xl bg-brg-light rotate-6 hover:-translate-y-3 hover:translate-x-2 transition-all duration-500 ease-out"
							alt="Miata in a valley"
						/>

						<img
							src="https://store.miataregistry.com/app/car/about-3.jpg"
							className="absolute top-44 left-0 w-64 h-48 lg:right-40 lg:top-72 lg:w-96 lg:h-64 rounded-lg object-cover shadow-xl bg-brg-light rotate-3 hover:-translate-y-3 hover:translate-x-2 transition-all duration-500 ease-out"
							alt="A group of Miatas in a field"
						/>

						<img
							src="https://store.miataregistry.com/app/car/about-8.jpg"
							className="absolute right-0 top-24 size-40 lg:right-0 lg:top-24 lg:size-72 rounded-lg object-cover shadow-xl bg-brg-light -rotate-3 hover:-translate-y-3 hover:-translate-x-2 transition-all duration-500 ease-out"
							alt="Miata in a field at dusk"
						/>
					</div>
				</div>
			</div>

			<div className="container mx-auto">
				<div
					id="statistics"
					className="flex flex-col gap-8 lg:gap-12 py-0 lg:py-24"
				>
					<h2
						className={`text-3xl font-medium text-center ${getHighlightClass('statistics')}`}
					>
						Registry Statistics
					</h2>

					<div className="grid grid-cols-2 lg:grid-cols-5 gap-4 gap-y-6 lg:gap-8">
						<StatisticItem
							value={stats?.cars ?? 0}
							label="Total Vehicles"
						/>

						<StatisticItem
							value={stats?.claimedCars ?? 0}
							label="Claimed Vehicles"
						/>

						<StatisticItem
							value={stats?.editions ?? 0}
							label="Limited Editions"
						/>

						<StatisticItem
							value={stats?.countries ?? 0}
							label="Countries Represented"
						/>

						<StatisticItem
							value={Promise.resolve(commitCount)}
							className="col-span-2 lg:col-span-1"
							label="Code Releases"
						/>
					</div>
				</div>
			</div>

			<div className="container mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
					<div id="open-source" className="prose">
						<h2
							className={`mb-3 lg:mb-5 text-xl font-medium ${getHighlightClass('open-source')}`}
						>
							Open Source Commitment
						</h2>

						<p className="text-sm text-brg-mid">
							The Miata Registry is proudly open source under the
							AGPL-3.0 license. This means our code is freely
							available for anyone to inspect, modify, and
							improve. We believe this transparency is crucial for
							a community resource—it ensures the project can
							continue to serve the Miata community regardless of
							any individual's involvement. Whether you're a
							developer wanting to contribute code or an
							enthusiast interested in how we verify registry
							entries, you can find everything about how we
							operate on our{' '}
							<a
								href="https://github.com/mcongrove/miata-registry"
								target="_blank"
								rel="noopener noreferrer"
								className="underline font-normal text-brg-mid"
							>
								GitHub repository
							</a>
							.
						</p>
					</div>

					<div id="open-data" className="prose">
						<h2
							className={`mb-3 lg:mb-5 text-xl font-medium ${getHighlightClass('open-data')}`}
						>
							Open Data Access
						</h2>

						<p className="text-sm text-brg-mid">
							In keeping with our commitment to transparency, all
							registry data except personal login details is{' '}
							{isSignedIn ? (
								<span
									className="underline cursor-pointer"
									onClick={() => openModal('export')}
									data-cy="about-data-export-link"
								>
									freely available for public inspection
								</span>
							) : (
								'freely available for public inspection'
							)}
							. This includes vehicle information, production
							numbers, and historical documentation. We believe
							this openness helps maintain accuracy and allows
							researchers and enthusiasts to build upon our
							collective knowledge.
						</p>

						<p className="text-sm text-brg-mid">
							You must be a registered user to download the entire
							dataset as a precaution against misuse.
						</p>
					</div>

					<div id="verification" className="prose">
						<h2
							className={`mb-3 lg:mb-5 text-xl font-medium ${getHighlightClass('verification')}`}
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

						<p className="text-sm text-brg-mid">
							If you find an error in our registry, please contact
							us and we will review and update the entry.
						</p>
					</div>

					<div id="contribute" className="prose">
						<h2
							className={`mb-3 lg:mb-5 text-xl font-medium ${getHighlightClass('contribute')}`}
						>
							How to Contribute
						</h2>

						<p className="text-sm text-brg-mid">
							There are several ways you can help grow and improve
							the Miata Registry. If you own a limited edition
							Miata, you can create an account and claim your
							vehicle by providing documentation and photos. Know
							of other limited edition Miatas in your area?{' '}
							<span
								onClick={() => openModal('tip')}
								className="underline cursor-pointer"
							>
								Submit a tip
							</span>{' '}
							and our verification team will follow up.
						</p>

						<p className="text-sm text-brg-mid">
							For developers interested in improving the platform
							itself, our codebase is open source on{' '}
							<a
								href="https://github.com/mcongrove/miata-registry"
								target="_blank"
								rel="noopener noreferrer"
								className="underline font-normal text-brg-mid"
							>
								GitHub
							</a>{' '}
							and we welcome pull requests.
						</p>

						<p className="text-sm text-brg-mid">
							Every contribution, whether it's registering your
							own car or helping verify others, makes the registry
							a more valuable resource for the entire Miata
							community.
						</p>
					</div>

					<div id="acknowledgements" className="prose">
						<h2
							className={`mb-3 lg:mb-5 text-xl font-medium ${getHighlightClass('acknowledgements')}`}
						>
							Acknowledgements
						</h2>

						<p className="text-sm text-brg-mid">
							We would like to thank all the contributors who have
							helped make the Miata Registry a success. Special
							thanks to Miata.net and all of their forum members.
							Additional thanks Katla, Harper, Kirsten, Terri, and
							the countless Miata and car community members who
							have helped verify and validate registry entries.
						</p>

						<p className="text-sm text-brg-mid">
							Much of the initial dataset was sourced from
							registries maintained by All Roadster (Evolution
							Orange), Barry Weyand (Laguna Blue), Justin Porter
							(Sunburst Yellow), Bonnie Lutz (Sunburst Yellow),
							Curtis Wiseman (Sunburst Yellow), Ed Menzenski (1991
							SE), Chris Owens (10th Anniversary), and David
							Gilbert (2001 SE). We'd like to thank them
							especially for their contributions to the Miata
							community.
						</p>
					</div>

					<div id="contact" className="flex flex-col gap-3">
						<h2
							className={`text-xl font-medium ${getHighlightClass('contact')}`}
						>
							Get in Touch
						</h2>

						{formError ? (
							<ErrorBanner error={formError} />
						) : isEmailSent ? (
							<p className="text-sm text-brg-mid">
								Thanks for your message, we'll get back to you
								soon.
							</p>
						) : (
							<form
								className="flex flex-col gap-4 mx-auto w-full max-w-2xl"
								onSubmit={handleSubmit}
							>
								<Field id="name" label="Name" required>
									<TextField
										id="name"
										name="name"
										placeholder="John Doe"
										required
									/>
								</Field>

								<Field id="email" label="Email" required>
									<TextField
										id="email"
										name="email"
										type="email"
										placeholder="email@example.com"
										required
									/>
								</Field>

								<Field id="message" label="Message" required>
									<TextField
										id="message"
										name="message"
										type="textarea"
										placeholder="Message"
										required
									/>
								</Field>

								<Button
									type="submit"
									disabled={isSubmitting}
									className="w-fit ml-auto"
								>
									{isSubmitting
										? 'Sending...'
										: 'Send Message'}
								</Button>
							</form>
						)}
					</div>
				</div>
			</div>
		</main>
	);
};
