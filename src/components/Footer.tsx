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
import { useModal } from '../context/ModalContext';
import { SitePulse } from './SitePulse';

export const Footer = () => {
	const { openModal } = useModal();

	return (
		<footer className="bg-brg-dark p-8 lg:pt-16 pb-8">
			<div className="container mx-auto">
				<div className="flex flex-col lg:flex-row gap-8 lg:gap-24 mb-8 lg:mb-16">
					<div className="lg:w-1/4">
						<div className="flex flex-col gap-1.5 w-32 mb-6 text-brg-mid">
							<Symbol className="w-full h-auto" />

							<small className="w-full text-center uppercase text-xs font-medium">
								The Miata Registry
							</small>
						</div>

						<p className="text-sm lg:text-base text-brg-mid mb-6">
							A community-driven project documenting the history
							of limited edition Mazda Miatas.
						</p>

						<div className="flex gap-4">
							<a
								href="https://www.instagram.com/miataregistry/"
								className="text-brg-mid hover:text-brg-light transition-colors"
								target="_blank"
								rel="noopener noreferrer"
							>
								<i className="fa-brands fa-instagram text-3xl" />

								<span className="sr-only">Instagram</span>
							</a>

							<a
								href="https://github.com/mcongrove/miata-registry"
								className="text-brg-mid hover:text-brg-light transition-colors"
								target="_blank"
								rel="noopener noreferrer"
							>
								<i className="fa-brands fa-github text-3xl" />

								<span className="sr-only">GitHub</span>
							</a>
						</div>
					</div>

					<div className="flex gap-8 lg:gap-16 text-sm lg:text-base">
						<div>
							<h3 className="font-medium text-white mb-4">
								Registry
							</h3>

							<ul className="space-y-2">
								<li>
									<Link
										to="/registry"
										className="text-brg-mid hover:text-brg-light transition-colors"
										data-cy="footer-browse-the-cars"
									>
										Browse Cars
									</Link>
								</li>
								<li>
									<Link
										to="/registry/editions"
										className="text-brg-mid hover:text-brg-light transition-colors"
									>
										Browse Editions
									</Link>
								</li>
								<li>
									<span
										onClick={() => openModal('register')}
										className="text-brg-mid hover:text-brg-light transition-colors cursor-pointer"
										data-cy="footer-register-your-miata"
									>
										Register your Miata
									</span>
								</li>
								<li>
									<span
										onClick={() => openModal('tip')}
										className="text-brg-mid hover:text-brg-light transition-colors cursor-pointer"
										data-cy="footer-submit-a-tip"
									>
										Register someone else's Miata
									</span>
								</li>
								<li>
									<Link
										to="/about#statistics"
										className="text-brg-mid hover:text-brg-light transition-colors"
									>
										Statistics
									</Link>
								</li>
							</ul>
						</div>

						<div>
							<h3 className="font-medium text-white mb-4">
								Resources
							</h3>

							<ul className="space-y-2">
								<li>
									<Link
										to="/about"
										className="text-brg-mid hover:text-brg-light transition-colors"
									>
										About
									</Link>
								</li>
								<li>
									<Link
										to="/rarity"
										className="flex items-center gap-1.5 text-brg-mid hover:text-brg-light transition-colors"
									>
										Rarity Scores{' '}
										<i className="fa-solid fa-crown text-sm text-yellow-300/50" />
									</Link>
								</li>
								<li>
									<Link
										to="/about#contact"
										className="text-brg-mid hover:text-brg-light transition-colors"
									>
										Contact
									</Link>
								</li>
								<li>
									<Link
										to="/legal"
										className="text-brg-mid hover:text-brg-light transition-colors"
									>
										Privacy Policy and Terms
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="flex flex-col items-center gap-8 border-t border-white/10 pt-8 text-xs lg:text-sm">
					<p className="text-center text-brg-mid/60">
						© {new Date().getFullYear()}{' '}
						<a
							href="https://mattcongrove.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-brg-mid underline whitespace-nowrap"
						>
							Matthew Congrove
						</a>
						.{' '}
						<a
							href="https://github.com/mcongrove/miata-registry"
							target="_blank"
							rel="noopener noreferrer"
							className="text-brg-mid underline whitespace-nowrap"
						>
							Source code
						</a>{' '}
						licensed under{' '}
						<a
							href="https://www.gnu.org/licenses/agpl-3.0.en.html"
							target="_blank"
							rel="noopener noreferrer"
							className="text-brg-mid underline whitespace-nowrap"
						>
							AGPL-3
						</a>
						. All other rights reserved. You can reach us at{' '}
						<a
							href="mailto:support@miataregistry.com"
							className="text-brg-mid underline whitespace-nowrap"
						>
							support@miataregistry.com
						</a>
						.
					</p>

					<SitePulse />
				</div>
			</div>
		</footer>
	);
};
