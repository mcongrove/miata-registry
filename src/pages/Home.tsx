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

import { Link } from 'react-router-dom';
import Symbol from '../assets/symbol.svg?react';
import { Button } from '../components/Button';
import { Credit } from '../components/Credit';
import { TimelineItem } from '../components/home/TimelineItem';
import { Icon } from '../components/Icon';
import { Tooltip } from '../components/Tooltip';

export const Home = () => {
	return (
		<>
			<header className="h-[90vh] flex bg-brg-light">
				<div className="w-1/2 px-16 flex items-center ">
					<div className="pr-40 flex flex-col gap-10">
						<Symbol className="w-40 h-auto text-brg mb-6" />

						<button className="inline-flex w-fit items-center gap-2 text-sm text-brg-mid hover:text-brg rounded-full border border-brg-border hover:border-brg-mid transition-colors px-4 py-2">
							The registry is now open!
							<Link to="/about">
								<span className="text-brg font-medium">
									Read more →
								</span>
							</Link>
						</button>

						<div className="flex flex-col gap-3">
							<h1 className="text-6xl font-medium text-brg">
								Welcome to the Miata Registry
							</h1>

							<p className="text-xl text-brg-mid">
								A community-driven project that aims to document
								and preserve the history of limited edition
								Mazda Miatas.
							</p>
						</div>

						<div className="flex items-center gap-4 text-sm">
							<Tooltip content="Coming soon!">
								<Button className="flex flex-col" disabled>
									Claim your Miata
								</Button>
							</Tooltip>

							<Button
								variant="tertiary"
								withArrow
								href="/registry"
							>
								View the registry
							</Button>
						</div>
					</div>
				</div>

				<div className="w-1/2 h-full relative">
					<img
						src="https://store.miataregistry.com/app/car/1991SE182.jpg"
						alt="1991 British Racing Green #182"
						className="w-full h-full object-cover object-left"
					/>

					<div className="absolute bottom-4 right-4">
						<Credit
							id="63621393-a540-46b5-b9fe-9231fea2730f"
							direction="left"
						/>
					</div>

					<svg
						className="absolute inset-0 w-full h-full pointer-events-none"
						preserveAspectRatio="none"
						viewBox="0 0 100 100"
					>
						<path d="M7 0 L0 100 L0 0 Z" fill="#E8EBEA" />
					</svg>
				</div>
			</header>

			<main className="relative bg-white overflow-hidden">
				<svg
					className="absolute top-0 left-0 w-full h-[90vh] pointer-events-none"
					preserveAspectRatio="none"
					viewBox="0 0 100 100"
				>
					<defs>
						<linearGradient
							id="fadeGradient"
							x1="0"
							x2="0"
							y1="0"
							y2="1"
						>
							<stop
								offset="0%"
								stopColor="#E8EBEA"
								stopOpacity="1"
							/>
							<stop
								offset="30%"
								stopColor="#E8EBEA"
								stopOpacity="0"
							/>
						</linearGradient>
					</defs>

					<path
						d="M0 0 L0 100 L47 100 L50 0 Z"
						fill="url(#fadeGradient)"
					/>
				</svg>

				<div className="relative min-h-[500px]">
					<div className="flex">
						<div className="w-1/2">
							<div className="container mx-auto">
								<div className="relative">
									<div className="absolute left-1/2 transform -translate-x-1/2 -top-24 h-full w-px bg-gradient-to-b from-transparent via-brg-border to-transparent"></div>

									<div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>

									<div className="space-y-16 py-24">
										<TimelineItem
											year="1991"
											title="British Racing Green"
											units="4,000"
											position="right"
										/>
										<TimelineItem
											year="1992"
											title="Sunburst Yellow"
											units="1,519"
											position="left"
										/>
										<TimelineItem
											year="1993"
											title="Limited Edition"
											units="1,500"
											position="right"
										/>
										<TimelineItem
											year="1995"
											title="Mazdaspeed Miata"
											units="4,000"
											position="left"
										/>
										<TimelineItem
											year="1999"
											title="10th Anniversary Edition"
											units="7,500"
											position="right"
										/>
										<TimelineItem
											year="2001"
											title="Special Edition"
											units="3,000"
											position="left"
										/>
									</div>
								</div>
							</div>
						</div>

						<div className="w-1/2 p-24">
							<h1 className="text-4xl font-bold text-brg mb-6">
								The Miata Registry
							</h1>

							<p className="text-brg-mid">
								Welcome to the Miata Registry, a
								community-driven database dedicated to tracking
								and preserving the history of limited edition
								Mazda Miatas. Our mission is to document these
								unique vehicles and help enthusiasts connect
								with rare and significant editions from across
								the Miata's storied history.
							</p>

							<p className="text-brg-mid mt-4">
								From the iconic British Racing Green edition to
								the exclusive 25th Anniversary edition, we're
								building a comprehensive record of these limited
								cars. Whether you're an owner, collector, or
								enthusiast, the Registry serves as your
								definitive resource for limited edition Miata
								information and history.
							</p>

							<h2 className="text-2xl font-bold text-brg mb-4 mt-12">
								Built for Longevity
							</h2>

							<p className="text-brg-mid">
								Many Miata registries and databases have
								disappeared over time, taking their valuable
								historical data with them when their maintainers
								moved on.
							</p>

							<p className="text-brg-mid mt-4">
								Our registry is different. Built on open-source
								principles and powered by community
								contributions, it doesn't rely on any single
								individual to stay alive.
							</p>

							<p className="text-brg-mid mt-4">
								This sustainable approach ensures the registry
								will continue to grow and remain accessible for
								future generations of Miata enthusiasts.
							</p>

							<h2 className="text-2xl font-bold text-brg mb-4 mt-12">
								Every Edition Matters
							</h2>

							<p className="text-brg-mid">
								While popular limited editions like the M
								Edition are well documented, many lesser-known
								limited runs have fascinating stories waiting to
								be preserved.
							</p>

							<p className="text-brg-mid mt-4">
								Our system can track any unique variant, from
								large international releases to small
								dealer-specific runs, documenting their
								features, numbers, and significance.
							</p>

							<p className="text-brg-mid mt-4">
								Through ongoing research and community input,
								we're continually expanding our database to
								ensure no limited edition is forgotten.
							</p>
						</div>
					</div>
				</div>

				{/*
				<div className="container mx-auto flex flex-col gap-40 py-20">
					<div>
						<div className="text-center mb-12">
							<h2 className="text-2xl font-bold text-brg mb-4">
								Community Collaborators
							</h2>

							<p className="text-brg-mid max-w-xl mx-auto">
								We're grateful to collaborate with these amazing
								organizations and communities who share our
								passion for preserving Miata history
							</p>
						</div>

						<div className="flex justify-center items-center gap-24 grayscale">
							<a
								href="https://miatanet.com"
								target="_blank"
								rel="noopener noreferrer"
							>
								<img
									src="https://store.miataregistry.com/app/partner/miatanet.jpg"
									alt="Miata.net"
									className="max-h-32 max-w-32 w-auto h-auto"
								/>
							</a>

							<a
								href="https://www.instagram.com/brgeunosownersclub"
								target="_blank"
								rel="noopener noreferrer"
							>
								<img
									src="https://store.miataregistry.com/app/partner/brgeunosownersclub.jpg"
									alt="BRG Eunos Owners Club"
									className="max-h-20 max-w-20 w-auto h-auto"
								/>
							</a>

							<a
								href="https://www.mazdaforum.com/"
								target="_blank"
								rel="noopener noreferrer"
							>
								<img
									src="https://store.miataregistry.com/app/partner/mazdaforum.jpg"
									alt="Mazda Forum"
									className="max-h-32 max-w-32 w-auto h-auto"
								/>
							</a>

							<a
								href="https://www.mx5nutz.com/"
								target="_blank"
								rel="noopener noreferrer"
							>
								<img
									src="https://store.miataregistry.com/app/partner/mx5nutz.jpg"
									alt="MX5 Nutz"
									className="max-h-32 max-w-32 w-auto h-auto"
								/>
							</a>

							<a
								href="https://www.clubroadster.net/"
								target="_blank"
								rel="noopener noreferrer"
							>
								<img
									src="https://store.miataregistry.com/app/partner/clubroadster.jpg"
									alt="Club Roadster"
									className="max-h-32 max-w-32 w-auto h-auto"
								/>
							</a>
						</div>
					</div>
				</div>
				*/}

				<div className="bg-brg-light">
					<div className="flex flex-row items-stretch">
						<div className="w-1/3 relative">
							<img
								src="https://store.miataregistry.com/app/car/about-3.jpg"
								className="absolute inset-0 w-full h-full object-cover object-bottom scale-x-[-1]"
							/>

							<svg
								className="absolute top-0 left-0 bottom-0 -right-px pointer-events-none"
								preserveAspectRatio="none"
								viewBox="0 0 100 100"
							>
								<path
									d="M93 0 L100 100 L100 0 Z"
									fill="#E8EBEA"
								/>
							</svg>
						</div>

						<div className="w-2/3 p-12">
							<h2 className="text-4xl font-bold text-brg mb-4">
								Register your limited edition Miata
							</h2>

							<p className="text-brg-mid text-lg mb-8">
								Help preserve Miata history by registering your
								limited edition model. Every registration adds
								to our collective knowledge and helps document
								these special cars for future generations.
							</p>

							<Tooltip content="Coming soon!">
								<Button disabled>Claim your Miata</Button>
							</Tooltip>

							<div className="flex flex-col items-start gap-3 mt-8 pt-8 border-t border-brg-border text-sm">
								<h3 className="flex gap-2 items-center text-brg-mid font-bold">
									<Icon name="info-circle" />
									Know of a limited edition Miata?
								</h3>

								<p className="text-brg-mid w-3/5">
									If you know someone with a limited edition
									Miata or have spotted one, you can help by
									submitting information about the car. Every
									detail helps build our registry.
								</p>

								<Link to="/about#contact">
									<Button
										variant="secondary"
										withArrow
										className="text-xs mt-2"
									>
										Submit a Tip
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	);
};
