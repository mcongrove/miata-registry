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

import { useState } from 'react';
import { compressCarPhoto } from '../../utils/carPhoto';

interface PhotoUploadProps {
	disabled?: boolean;
	error?: string | null;
	onClear: () => void;
	onPhotoStaged: (file: File, previewUrl: string) => void;
	previewUrl?: string | null;
}

export function PhotoUpload({
	disabled = false,
	error = null,
	onClear,
	onPhotoStaged,
	previewUrl = null,
}: PhotoUploadProps) {
	const [preparing, setPreparing] = useState(false);
	const [localError, setLocalError] = useState<string | null>(null);

	const displayError = error ?? localError;
	const hasPreview = Boolean(previewUrl);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		e.target.value = '';

		if (!file) return;

		setLocalError(null);
		setPreparing(true);

		try {
			const compressedFile = await compressCarPhoto(file);
			const url = URL.createObjectURL(compressedFile);

			onPhotoStaged(compressedFile, url);
		} catch (err) {
			setLocalError(
				err instanceof Error ? err.message : 'Failed to process image'
			);
		} finally {
			setPreparing(false);
		}
	};

	if (hasPreview && previewUrl) {
		return (
			<div className="relative w-full max-w-[300px] overflow-hidden rounded-lg border border-brg-border/60 bg-brg-light/20">
				<img
					src={previewUrl}
					alt="Selected car photo preview"
					className="aspect-[3/2] w-full object-cover bg-brg-light/30"
				/>

				<button
					type="button"
					onClick={onClear}
					disabled={disabled || preparing}
					className="absolute top-2 right-2 text-xs font-medium px-2.5 py-1 rounded-md bg-white/95 text-brg border border-brg-border/60 hover:bg-white disabled:opacity-50"
				>
					Remove
				</button>
			</div>
		);
	}

	return (
		<div className="relative w-full max-w-[300px]">
			<input
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				disabled={disabled || preparing}
				className="absolute inset-0 z-10 h-full w-full opacity-0 [&:not(:disabled)]:cursor-pointer"
			/>

			<div className="flex aspect-[3/2] w-full items-center justify-center rounded-lg border-2 border-dashed border-brg-light bg-brg-light/10 text-sm">
				{preparing ? (
					<p className="flex gap-2 items-center text-brg-mid">
						<i className="fa-solid fa-spinner fa-spin" />
						Preparing image…
					</p>
				) : displayError ? (
					<p className="text-red-700 px-4 text-center">
						{displayError}
					</p>
				) : (
					<div className="flex flex-col gap-1 items-center justify-center text-brg-mid">
						<i className="fa-solid fa-camera-retro text-2xl" />

						<p>
							Click or drag to upload{' '}
							<span className="text-brg-border">10MB max</span>
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
