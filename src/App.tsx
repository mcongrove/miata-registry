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

// import { useState, useEffect } from 'react';
// import { initializeApp } from 'firebase/app';
// import { getAnalytics, logEvent } from 'firebase/analytics';
// import {
//     getAuth,
//     onAuthStateChanged,
//     GoogleAuthProvider,
//     signInWithPopup,
//     User,
// } from 'firebase/auth';
// import { AuthenticatedView } from './components/AuthenticatedView';
// import { PublicView } from './components/PublicView';
import Symbol from './assets/symbol.svg?react';
import { TimelineItem } from './components/home/TimelineItem';
import { Credit } from './components/Credit';
import { Button } from './components/Button';
import { Header } from './components/Header';
import { BrowserRouter } from 'react-router-dom';

// const firebaseConfig = {
//     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//     databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
//     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//     appId: import.meta.env.VITE_FIREBASE_APP_ID,
//     measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const analytics = getAnalytics(app);

// const signInWithGoogle = async () => {
//     const provider = new GoogleAuthProvider();
//     try {
//         await signInWithPopup(auth, provider);
//     } catch (error) {
//         console.error('Error signing in with Google:', error);
//     }
// };

function App() {
	// const [user, setUser] = useState<User | null>(null);
	// const [loading, setLoading] = useState(true);

	// useEffect(() => {
	//     logEvent(analytics, 'page_view', {
	//         page_title: 'Home',
	//         page_location: window.location.href,
	//     });

	//     const unsubscribe = onAuthStateChanged(auth, (user) => {
	//         setUser(user);
	//         setLoading(false);

	//         if (user) {
	//             logEvent(analytics, 'login', {
	//                 method: 'Google',
	//             });
	//         } else {
	//             logEvent(analytics, 'sign_out');
	//         }
	//     });

	//     return () => unsubscribe();
	// }, []);

	// const handleSignIn = async () => {
	//     try {
	//         logEvent(analytics, 'login_start', {
	//             method: 'Google',
	//         });

	//         await signInWithGoogle();
	//     } catch (error) {
	//         logEvent(analytics, 'error', {
	//             error_message: (error as Error).message,
	//             error_type: 'auth_error',
	//         });
	//     }
	// };

	// if (loading) {
	//     return <div>Loading...</div>;
	// }

	return (
		<BrowserRouter>
			<Header />

			<header className="h-[90vh] flex bg-brg-light">
				<div className="w-1/2 px-16 flex items-center ">
					<div className="pr-40 flex flex-col gap-10">
						<Symbol className="w-40 h-auto text-brg mb-6" />

						<button className="inline-flex w-fit items-center gap-2 text-sm text-brg-mid hover:text-brg rounded-full border border-brg-border hover:border-brg-mid transition-colors px-4 py-2">
							The registry is now open!
							<span className="text-brg font-medium">
								Read more →
							</span>
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
							<Button>Register your Miata</Button>

							<Button variant="tertiary" withArrow>
								View the registry
							</Button>
						</div>
					</div>
				</div>

				<div className="w-1/2 h-full relative">
					<img
						src="/images/cars/1991SE182.jpg"
						alt="1991 British Racing Green #182"
						className="w-full h-full object-cover object-left"
					/>

					<div className="absolute bottom-4 right-4">
						<Credit
							car="1991 British Racing Green"
							number="182"
							owner="Matthew Congrove, Texas, USA"
							id="1-182"
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
								with rare and significant models from across the
								Miata's storied history.
							</p>

							<p className="text-brg-mid mt-4">
								From the iconic British Racing Green edition to
								the exclusive 25th Anniversary model, we're
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

				<div className="w-[90vw] mx-auto flex flex-col gap-40 py-20">
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
									src="/images/partners/miatanet.jpg"
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
									src="/images/partners/brgeunosownersclub.jpg"
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
									src="/images/partners/mazdaforum.jpg"
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
									src="/images/partners/mx5nutz.jpg"
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
									src="/images/partners/clubroadster.jpg"
									alt="Club Roadster"
									className="max-h-32 max-w-32 w-auto h-auto"
								/>
							</a>
						</div>
					</div>

					<div>
						<div className="bg-brg rounded-2xl shadow-lg overflow-hidden">
							<div className="flex flex-row items-center">
								<div className="w-1/3 relative">
									<img
										src="/images/cars/1992SBY1176.jpg"
										alt="1992 Sunburst Yellow #1176"
										className="w-full h-full object-cover"
									/>
									<div className="absolute bottom-4 left-4">
										<Credit
											car="1992 Sunburst Yellow"
											number="1176"
											owner="MaxWellSmart1919, Oregon, USA"
											id="2-1176"
											direction="right"
										/>
									</div>
								</div>

								<div className="w-2/3 p-12">
									<h2 className="text-4xl font-bold text-white mb-4">
										Register your limited edition Miata
									</h2>

									<p className="text-white/50 text-lg mb-8">
										Help preserve Miata history by
										registering your limited edition model.
										Every registration adds to our
										collective knowledge and helps document
										these special cars for future
										generations.
									</p>

									<Button variant="secondary" withArrow>
										Register your Miata
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>

			<footer className="bg-gradient-to-b from-brg-dark to-[#070E0C] pt-16 pb-8">
				<div className="container mx-auto">
					<div className="flex gap-24 mb-16">
						<div className="w-1/4">
							<Symbol className="w-32 h-auto text-brg-mid mb-6" />

							<p className="text-brg-mid mb-8">
								A community-driven project documenting the
								history of limited edition Mazda Miatas.
							</p>

							<div className="flex gap-4">
								<a
									href="https://instagram.com"
									className="text-brg-mid hover:text-brg transition-colors"
								>
									<svg
										className="size-7"
										fill="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											fillRule="evenodd"
											d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
											clipRule="evenodd"
										/>
									</svg>
								</a>

								<a
									href="https://twitter.com"
									className="text-brg-mid hover:text-brg transition-colors"
								>
									<svg
										className="size-7"
										fill="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
									</svg>
								</a>

								<a
									href="https://github.com/mcongrove/miata-registry"
									className="text-brg-mid hover:text-brg transition-colors"
								>
									<svg
										className="size-7"
										fill="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											fillRule="evenodd"
											d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
											clipRule="evenodd"
										/>
									</svg>
								</a>
							</div>
						</div>

						<div className="flex gap-16">
							<div>
								<h3 className="font-medium text-white mb-4">
									Registry
								</h3>

								<ul className="space-y-2">
									<li>
										<a
											href="#"
											className="text-brg-mid hover:text-brg transition-colors"
										>
											Browse Cars
										</a>
									</li>
									<li>
										<a
											href="#"
											className="text-brg-mid hover:text-brg transition-colors"
										>
											Register Your Car
										</a>
									</li>
									<li>
										<a
											href="#"
											className="text-brg-mid hover:text-brg transition-colors"
										>
											Search
										</a>
									</li>
									<li>
										<a
											href="#"
											className="text-brg-mid hover:text-brg transition-colors"
										>
											Statistics
										</a>
									</li>
								</ul>
							</div>

							<div>
								<h3 className="font-medium text-white mb-4">
									Resources
								</h3>

								<ul className="space-y-2">
									<li>
										<a
											href="#"
											className="text-brg-mid hover:text-brg transition-colors"
										>
											About
										</a>
									</li>
									<li>
										<a
											href="#"
											className="text-brg-mid hover:text-brg transition-colors"
										>
											Contact
										</a>
									</li>
									<li>
										<a
											href="#"
											className="text-brg-mid hover:text-brg transition-colors"
										>
											Privacy Policy
										</a>
									</li>
									<li>
										<a
											href="#"
											className="text-brg-mid hover:text-brg transition-colors"
										>
											Terms of Service
										</a>
									</li>
								</ul>
							</div>
						</div>
					</div>

					<div className="border-t border-white/10 pt-8">
						<p className="text-sm text-brg-mid text-center">
							© {new Date().getFullYear()} Matthew Congrove.
							Source code licensed under AGPL-3.0. All other
							rights reserved.
						</p>
					</div>
				</div>
			</footer>

			{/* {window.location.pathname !== '/' && (
                <header>
                    <h1>Miata Registry</h1>
                    {user ? (
                        <div>
                            <button
                                onClick={() => {
                                    logEvent(analytics, 'sign_out_start');
                                    auth.signOut();
                                }}
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleSignIn}>
                            Sign in with Google
                        </button>
                    )}
                </header>
            )}

            <main>
                {user ? <AuthenticatedView user={user} /> : <PublicView />}
            </main> */}
		</BrowserRouter>
	);
}

export default App;
