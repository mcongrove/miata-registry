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
import Instagram from '../../assets/logos/instagram.svg?react';
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
						<Instagram className="size-[17px]" />
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
