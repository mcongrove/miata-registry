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
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { TOwner } from '../../types/Owner';
import { formatLocation, parseLocation } from '../../utils/geo';
import { handleApiError } from '../../utils/global';
import { Location } from '../form/Location';
import { TextField } from '../form/TextField';

export const ClerkProfile = ({
	owner,
	onUpdate,
}: {
	owner: TOwner;
	onUpdate: () => void;
}) => {
	const { getToken } = useAuth();
	const [location, setLocation] = useState(
		formatLocation({
			city: owner.city || '',
			state: owner.state || '',
			country: owner.country || '',
		})
	);
	const [instagram, setInstagram] = useState(owner.links?.instagram || '');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsSubmitting(true);
		setError(null);
		setSuccess(false);

		try {
			const token = await getToken();

			const response = await fetch(
				`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/owners/${owner.user_id}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						location: location ? parseLocation(location) : null,
						links: {
							instagram: instagram || null,
						},
					}),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to update profile');
			}

			setSuccess(true);

			setTimeout(() => {
				onUpdate();
			}, 2000);
		} catch (err) {
			handleApiError(error);
			setError('Failed to submit form. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4">
			<div className="flex gap-6">
				<div className="w-44 py-1.5 shrink-0">
					<p className="text-[#212126] font-medium text-[13px] py-2">
						Location
					</p>
				</div>

				<div className="w-full pt-[5px] pb-1.5">
					<Location
						id="location"
						name="location"
						placeholder="Enter a location"
						className="text-[#212126] md:!text-[13px] border-[#E1E1E1] focus:border-[#A2A2A2] focus:ring-[3px] focus:ring-[#E3E3E3] transition-all"
						value={location || ''}
						onLocationSelect={(value) => setLocation(value)}
					/>
				</div>
			</div>

			<hr className="border-black/[0.07]" />

			<div className="flex gap-6">
				<div className="w-44 py-1.5 shrink-0">
					<p className="text-[#212126] font-medium text-[13px] py-2">
						Social links
					</p>
				</div>

				<div className="flex gap-2 items-center w-full pt-[5px] pb-1.5">
					<div>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 132 132"
							className="size-[17px]"
							xmlnsXlink="http://www.w3.org/1999/xlink"
						>
							<defs>
								<linearGradient id="b">
									<stop offset="0" stop-color="#3771c8" />
									<stop stop-color="#3771c8" offset=".128" />
									<stop
										offset="1"
										stop-color="#60f"
										stop-opacity="0"
									/>
								</linearGradient>
								<linearGradient id="a">
									<stop offset="0" stop-color="#fd5" />
									<stop offset=".1" stop-color="#fd5" />
									<stop offset=".5" stop-color="#ff543e" />
									<stop offset="1" stop-color="#c837ab" />
								</linearGradient>
								<radialGradient
									id="c"
									cx="158.429"
									cy="578.088"
									r="65"
									xlinkHref="#a"
									gradientUnits="userSpaceOnUse"
									gradientTransform="matrix(0 -1.98198 1.8439 0 -1031.402 454.004)"
									fx="158.429"
									fy="578.088"
								/>
								<radialGradient
									id="d"
									cx="147.694"
									cy="473.455"
									r="65"
									xlinkHref="#b"
									gradientUnits="userSpaceOnUse"
									gradientTransform="matrix(.17394 .86872 -3.5818 .71718 1648.348 -458.493)"
									fx="147.694"
									fy="473.455"
								/>
							</defs>
							<path
								fill="url(#c)"
								d="M65.03 0C37.888 0 29.95.028 28.407.156c-5.57.463-9.036 1.34-12.812 3.22-2.91 1.445-5.205 3.12-7.47 5.468C4 13.126 1.5 18.394.595 24.656c-.44 3.04-.568 3.66-.594 19.188-.01 5.176 0 11.988 0 21.125 0 27.12.03 35.05.16 36.59.45 5.42 1.3 8.83 3.1 12.56 3.44 7.14 10.01 12.5 17.75 14.5 2.68.69 5.64 1.07 9.44 1.25 1.61.07 18.02.12 34.44.12 16.42 0 32.84-.02 34.41-.1 4.4-.207 6.955-.55 9.78-1.28 7.79-2.01 14.24-7.29 17.75-14.53 1.765-3.64 2.66-7.18 3.065-12.317.088-1.12.125-18.977.125-36.81 0-17.836-.04-35.66-.128-36.78-.41-5.22-1.305-8.73-3.127-12.44-1.495-3.037-3.155-5.305-5.565-7.624C116.9 4 111.64 1.5 105.372.596 102.335.157 101.73.027 86.19 0H65.03z"
								transform="translate(1.004 1)"
							/>
							<path
								fill="url(#d)"
								d="M65.03 0C37.888 0 29.95.028 28.407.156c-5.57.463-9.036 1.34-12.812 3.22-2.91 1.445-5.205 3.12-7.47 5.468C4 13.126 1.5 18.394.595 24.656c-.44 3.04-.568 3.66-.594 19.188-.01 5.176 0 11.988 0 21.125 0 27.12.03 35.05.16 36.59.45 5.42 1.3 8.83 3.1 12.56 3.44 7.14 10.01 12.5 17.75 14.5 2.68.69 5.64 1.07 9.44 1.25 1.61.07 18.02.12 34.44.12 16.42 0 32.84-.02 34.41-.1 4.4-.207 6.955-.55 9.78-1.28 7.79-2.01 14.24-7.29 17.75-14.53 1.765-3.64 2.66-7.18 3.065-12.317.088-1.12.125-18.977.125-36.81 0-17.836-.04-35.66-.128-36.78-.41-5.22-1.305-8.73-3.127-12.44-1.495-3.037-3.155-5.305-5.565-7.624C116.9 4 111.64 1.5 105.372.596 102.335.157 101.73.027 86.19 0H65.03z"
								transform="translate(1.004 1)"
							/>
							<path
								fill="#fff"
								d="M66.004 18c-13.036 0-14.672.057-19.792.29-5.11.234-8.598 1.043-11.65 2.23-3.157 1.226-5.835 2.866-8.503 5.535-2.67 2.668-4.31 5.346-5.54 8.502-1.19 3.053-2 6.542-2.23 11.65C18.06 51.327 18 52.964 18 66s.058 14.667.29 19.787c.235 5.11 1.044 8.598 2.23 11.65 1.227 3.157 2.867 5.835 5.536 8.503 2.667 2.67 5.345 4.314 8.5 5.54 3.054 1.187 6.543 1.996 11.652 2.23 5.12.233 6.755.29 19.79.29 13.037 0 14.668-.057 19.788-.29 5.11-.234 8.602-1.043 11.656-2.23 3.156-1.226 5.83-2.87 8.497-5.54 2.67-2.668 4.31-5.346 5.54-8.502 1.18-3.053 1.99-6.542 2.23-11.65.23-5.12.29-6.752.29-19.788 0-13.036-.06-14.672-.29-19.792-.24-5.11-1.05-8.598-2.23-11.65-1.23-3.157-2.87-5.835-5.54-8.503-2.67-2.67-5.34-4.31-8.5-5.535-3.06-1.187-6.55-1.996-11.66-2.23-5.12-.233-6.75-.29-19.79-.29zm-4.306 8.65c1.278-.002 2.704 0 4.306 0 12.816 0 14.335.046 19.396.276 4.68.214 7.22.996 8.912 1.653 2.24.87 3.837 1.91 5.516 3.59 1.68 1.68 2.72 3.28 3.592 5.52.657 1.69 1.44 4.23 1.653 8.91.23 5.06.28 6.58.28 19.39s-.05 14.33-.28 19.39c-.214 4.68-.996 7.22-1.653 8.91-.87 2.24-1.912 3.835-3.592 5.514-1.68 1.68-3.275 2.72-5.516 3.59-1.69.66-4.232 1.44-8.912 1.654-5.06.23-6.58.28-19.396.28-12.817 0-14.336-.05-19.396-.28-4.68-.216-7.22-.998-8.913-1.655-2.24-.87-3.84-1.91-5.52-3.59-1.68-1.68-2.72-3.276-3.592-5.517-.657-1.69-1.44-4.23-1.653-8.91-.23-5.06-.276-6.58-.276-19.398s.046-14.33.276-19.39c.214-4.68.996-7.22 1.653-8.912.87-2.24 1.912-3.84 3.592-5.52 1.68-1.68 3.28-2.72 5.52-3.592 1.692-.66 4.233-1.44 8.913-1.655 4.428-.2 6.144-.26 15.09-.27zm29.928 7.97c-3.18 0-5.76 2.577-5.76 5.758 0 3.18 2.58 5.76 5.76 5.76 3.18 0 5.76-2.58 5.76-5.76 0-3.18-2.58-5.76-5.76-5.76zm-25.622 6.73c-13.613 0-24.65 11.037-24.65 24.65 0 13.613 11.037 24.645 24.65 24.645C79.617 90.645 90.65 79.613 90.65 66S79.616 41.35 66.003 41.35zm0 8.65c8.836 0 16 7.163 16 16 0 8.836-7.164 16-16 16-8.837 0-16-7.164-16-16 0-8.837 7.163-16 16-16z"
							/>
						</svg>
					</div>

					<p className="text-[#212126] text-[13px]">Instagram</p>

					<TextField
						id="links_instagram"
						name="links_instagram"
						placeholder="@miataregistry"
						className="ml-1 text-[#212126] md:!text-[13px] border-[#E1E1E1] focus:border-[#A2A2A2] focus:ring-[3px] focus:ring-[#E3E3E3] transition-all"
						value={instagram}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setInstagram(e.target.value)
						}
					/>
				</div>
			</div>

			<div className="flex gap-4 justify-end items-center">
				{error && <p className="text-red-600 text-sm">{error}</p>}

				{success && (
					<p className="text-green-600 text-sm">
						Profile updated successfully!
					</p>
				)}

				<button
					type="submit"
					disabled={isSubmitting}
					className={twMerge(
						'min-w-[54px] h-[30px] text-[13px] font-medium bg-[#2F3037] text-white rounded-md py-1.5 px-3',
						isSubmitting ? 'opacity-50' : ''
					)}
				>
					{isSubmitting ? 'Saving...' : 'Save'}
				</button>
			</div>
		</form>
	);
};
