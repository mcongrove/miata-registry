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

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StatisticItem } from '../components/about/StatisticItem';
import { AGPL_LICENSE_URL, GITHUB_REPO_URL } from '../constants/repo';
import { Button } from '../components/Button';
import { ErrorBanner } from '../components/ErrorBanner';
import { Field } from '../components/form/Field';
import { TextField } from '../components/form/TextField';
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
	const [highlightedSection, setHighlightedSection] = useState<string | null>(
		null
	);
	const [commitCount, setCommitCount] = useState<number>(0);
	const location = useLocation();
	const [isEmailSent, setIsEmailSent] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [isFormValid, setIsFormValid] = useState(false);
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

	useEffect(() => {
		const form = document.querySelector(
			'form#contactForm'
		) as HTMLFormElement;

		if (form) {
			const checkValidity = () => {
				setIsFormValid(form.checkValidity());
			};

			checkValidity();

			form.querySelectorAll('input, select, textarea').forEach(
				(input) => {
					input.addEventListener('input', checkValidity);
				}
			);

			return () => {
				form.querySelectorAll('input, select, textarea').forEach(
					(input) => {
						input.removeEventListener('input', checkValidity);
					}
				);
			};
		}
	}, []);

	const getHighlightClass = (sectionId: string) => {
		return highlightedSection === sectionId ? 'text-white' : 'text-brg';
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
				<div className="relative z-10 flex flex-col gap-8 lg:w-1/2 lg:bg-white lg:pr-6">
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

				<div className="flex w-full shrink-0 items-center justify-center overflow-visible lg:w-1/2">
					<div className="relative mx-auto h-[30rem] w-full max-w-[22rem] overflow-visible sm:max-w-md lg:h-[34rem] lg:w-[34rem] lg:max-w-none">
						<img
							src="https://store.miataregistry.com/app/car/about-1.jpg"
							className="absolute left-[10%] top-2 z-20 size-48 rotate-6 rounded-lg bg-brg-light object-cover object-left shadow-xl transition-all duration-500 ease-out hover:-translate-y-3 hover:translate-x-2 lg:left-auto lg:right-52 lg:top-4 lg:size-64"
							alt="Miata in a valley"
						/>

						<img
							src="https://store.miataregistry.com/app/car/about-3.jpg"
							className="absolute bottom-2 left-0 z-10 h-52 w-64 rotate-3 rounded-lg bg-brg-light object-cover shadow-xl transition-all duration-500 ease-out hover:-translate-y-3 hover:translate-x-2 lg:bottom-auto lg:left-auto lg:right-32 lg:top-[17rem] lg:z-10 lg:h-64 lg:w-96"
							alt="A group of Miatas in a field"
						/>

						<img
							src="https://store.miataregistry.com/app/car/about-8.jpg"
							className="absolute right-0 top-28 z-30 size-44 -rotate-3 rounded-lg bg-brg-light object-cover object-bottom shadow-xl transition-all duration-500 ease-out hover:-translate-y-3 hover:-translate-x-2 lg:top-24 lg:size-72"
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
				<div id="faq" className="flex flex-col gap-8 py-0 lg:py-16">
					<h2 className="text-3xl font-medium text-center text-brg">
						Frequently Asked Questions
					</h2>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
						<div>
							<h3 className="text-lg font-medium text-brg mb-2">
								What is the Miata Registry?
							</h3>

							<p className="text-sm text-brg-mid">
								The Miata Registry is a community-driven
								database that documents limited edition Mazda
								Miatas worldwide. It brings together production
								numbers, ownership history, photos, and stories
								for editions that were never collected in one
								place before.
							</p>
						</div>

						<div>
							<h3 className="text-lg font-medium text-brg mb-2">
								What counts as a limited edition Miata?
							</h3>

							<p className="text-sm text-brg-mid">
								A limited edition Miata is a factory-built
								variant with a defined production run, distinct
								trim, color, or equipment, and documented
								release by Mazda or a regional distributor.
								Examples include the 1991 Special Edition, 10th
								Anniversary, and 30th Anniversary editions.
							</p>
						</div>

						<div>
							<h3 className="text-lg font-medium text-brg mb-2">
								How are cars verified?
							</h3>

							<p className="text-sm text-brg-mid">
								Entries are reviewed by moderators before they
								appear as claimed. Owners submit documentation
								such as VIN records, window stickers, or title
								information along with photos. Corrections are
								updated after review.
							</p>
						</div>

						<div>
							<h3 className="text-lg font-medium text-brg mb-2">
								How is rarity calculated?
							</h3>

							<p className="text-sm text-brg-mid">
								Each car receives a rarity score based on
								production numbers, edition characteristics,
								preservation, documentation, mileage, and age.
								The methodology weights factory rarity against
								how well an individual car has been preserved
								over time. See our{' '}
								<Link to="/rarity" className="underline">
									rarity scoring guide
								</Link>{' '}
								for the full breakdown.
							</p>
						</div>

						<div className="lg:col-span-2">
							<h3 className="text-lg font-medium text-brg mb-2">
								How do I register my car?
							</h3>

							<p className="text-sm text-brg-mid">
								Create a free account, find your edition in the
								registry or start a new claim, and submit your
								VIN, sequence number, photos, and any ownership
								documentation you have. A moderator will review
								your submission and approve the claim once
								verified.
							</p>
						</div>
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
							The Miata Registry is proudly open source under the{' '}
							<a
								href={AGPL_LICENSE_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="underline font-normal text-brg-mid"
							>
								AGPL-3.0 license
							</a>
							. This means our code is freely available for anyone
							to inspect, modify, and improve. We believe this
							transparency is crucial for a community resource—it
							ensures the project can continue to serve the Miata
							community regardless of any individual's
							involvement. Whether you're a developer wanting to
							contribute code or an enthusiast interested in how
							we verify registry entries, you can find everything
							about how we operate on our{' '}
							<a
								href={GITHUB_REPO_URL}
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
							<a
								href="https://archive.org/details/@miataregistry"
								target="_blank"
								rel="noopener noreferrer"
								className="underline font-normal text-brg-mid"
								data-cy="about-data-export-link"
							>
								freely available for public inspection
							</a>
							. This includes vehicle information, production
							numbers, and historical documentation. We believe
							this openness helps maintain accuracy and allows
							researchers and enthusiasts to build upon our
							collective knowledge.
						</p>

						<p className="text-sm text-brg-mid">
							Our entire dataset is backed up weekly and stored on
							the Internet Archive, the world's largest digital
							library, to ensure it is always available to the
							public.
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
							Miata, create an account and claim your vehicle by
							providing documentation and photos. Spotted an error
							or know of a car that should be listed? Contact us
							and our verification team will follow up.
						</p>

						<p className="text-sm text-brg-mid">
							For developers interested in improving the platform
							itself, our codebase is open source on{' '}
							<a
								href={GITHUB_REPO_URL}
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
							Curtis Wiseman (Sunburst Yellow), Chris Owens (10th
							Anniversary), David Gilbert (2001 SE), and Nathan
							Ballard (30th Anniversary). We'd like to thank them
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
								id="contactForm"
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
									disabled={!isFormValid || isSubmitting}
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
