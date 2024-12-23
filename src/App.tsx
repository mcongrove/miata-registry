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

import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';
import {
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    User,
} from 'firebase/auth';
import { AuthenticatedView } from './components/AuthenticatedView';
import { PublicView } from './components/PublicView';
import Symbol from './assets/symbol.svg?react';
import ImageHero from './assets/hero.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error('Error signing in with Google:', error);
    }
};

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        logEvent(analytics, 'page_view', {
            page_title: 'Home',
            page_location: window.location.href,
        });

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);

            if (user) {
                logEvent(analytics, 'login', {
                    method: 'Google',
                });
            } else {
                logEvent(analytics, 'sign_out');
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSignIn = async () => {
        try {
            logEvent(analytics, 'login_start', {
                method: 'Google',
            });

            await signInWithGoogle();
        } catch (error) {
            logEvent(analytics, 'error', {
                error_message: (error as Error).message,
                error_type: 'auth_error',
            });
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <header className="h-[90vh] flex bg-brg-light">
                <div className="w-1/2 flex items-center justify-center">
                    <div className="max-w-[600px] flex flex-col px-16 gap-10">
                        <Symbol className="w-40 h-auto text-brg mb-6" />

                        <button className="inline-flex w-fit items-center gap-2 text-sm text-brg-mid hover:text-brg rounded-full border border-brg-border hover:border-brg-mid transition-colors px-4 py-2">
                            The registry is now open!
                            <span className="text-brg font-medium">
                                Read more{' '}
                                <FontAwesomeIcon
                                    icon={faArrowRight}
                                    className="text-xs"
                                />
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
                            <button className="bg-brg hover:bg-brg-dark transition-colors text-white rounded-md px-4 py-3">
                                Register your Miata
                            </button>

                            <button className="text-brg hover:text-brg-dark transition-colors">
                                View the registry{' '}
                                <FontAwesomeIcon
                                    icon={faArrowRight}
                                    className="text-xs"
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-1/2 h-full relative">
                    <img
                        src={ImageHero}
                        alt="hero"
                        className="w-full h-full object-cover object-left"
                    />
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
                                offset="15%"
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

                <div className="relative min-h-[500px]"></div>
            </main>

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
        </>
    );
}

export default App;
