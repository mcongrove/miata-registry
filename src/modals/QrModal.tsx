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

import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { Button } from '../components/Button';
import { ErrorBanner } from '../components/ErrorBanner';
import { Modal } from '../components/Modal';
import { Field } from '../components/form/Field';
import { Location } from '../components/form/Location';
import { Select, SelectStyles } from '../components/form/Select';
import { TCar } from '../types/Car';
import { handleApiError } from '../utils/global';

export function QrModal({
	isOpen,
	onClose,
	props,
}: {
	props: {
		car?: TCar;
	};
	isOpen: boolean;
	onClose: () => void;
}) {
	const [showStickerForm, setShowStickerForm] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [quantity, setQuantity] = useState('1');
	const [selectedLocation, setSelectedLocation] = useState('');

	const car = props.car;
	const qrUrl = car ? `https://miataregistry.com/registry/${car.id}` : '';
	const imageSize = 250;

	const handleClose = () => {
		setShowStickerForm(false);
		setIsSuccess(false);
		onClose();
	};

	const handleDownload = () => {
		const setPathFill = (svg: SVGElement, fill: string) => {
			const paths = svg.querySelectorAll('path');

			paths.forEach((path) => {
				const currentFill = path.getAttribute('fill');

				if (currentFill && currentFill !== 'transparent') {
					path.setAttribute('fill', fill);
				}
			});
		};

		const svg = document.querySelector('svg.qr-code') as SVGElement;

		setPathFill(svg, 'black');

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		const svgData = new XMLSerializer().serializeToString(svg);
		const img = new Image();

		canvas.width = imageSize;
		canvas.height = imageSize;

		img.onload = () => {
			ctx?.drawImage(img, 0, 0);

			const downloadLink = document.createElement('a');

			downloadLink.download = `miata-registry-${car?.id}.png`;
			downloadLink.href = canvas.toDataURL('image/png');

			downloadLink.click();

			setPathFill(svg, '#172E28');
		};

		img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
	};

	const handleStickerSubmit = async (
		e?: React.FormEvent<HTMLFormElement>
	) => {
		if (e) {
			e.preventDefault();
		}

		setLoading(true);
		setFormError(null);

		try {
			const form = document.querySelector('form#stickerForm');

			if (!form) return;

			const formData = new FormData(form as HTMLFormElement);

			await fetch(
				`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/email/sticker`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						quantity: formData.get('quantity'),
						address: formData.get('address'),
						carId: car?.id,
					}),
				}
			);

			setIsSuccess(true);
		} catch (error) {
			handleApiError(error);
			setFormError('Failed to submit form. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	if (isSuccess) {
		return (
			<Modal
				isOpen={isOpen}
				onClose={handleClose}
				hideCancel
				action={{
					text: 'Close',
					onClick: handleClose,
				}}
				allowClickOut
			>
				<div className="flex flex-col items-center gap-6 pt-6">
					<div className="w-16 h-16 rounded-full bg-brg/10 flex items-center justify-center">
						<i className="fa-solid fa-fw fa-check text-brg text-3xl" />
					</div>

					<div className="text-center">
						<h2 className="text-2xl font-bold mb-2">Thank You!</h2>

						<p className="text-brg-mid">
							Your sticker request has been submitted.
						</p>

						<p className="text-brg-mid">
							We'll process your order and ship it soon!
						</p>
					</div>
				</div>
			</Modal>
		);
	}

	return (
		<Modal
			className={showStickerForm ? '' : 'max-w-fit'}
			isOpen={isOpen}
			onClose={handleClose}
			hideCancel={!showStickerForm}
			title={showStickerForm ? 'Request Window Sticker' : 'QR Codes'}
			allowClickOut={!showStickerForm}
			action={
				showStickerForm
					? {
							text: 'Submit',
							onClick: () => handleStickerSubmit(),
							loading,
						}
					: undefined
			}
		>
			{showStickerForm ? (
				<div className="flex flex-col gap-4">
					<ErrorBanner
						error={formError}
						onDismiss={() => setFormError(null)}
					/>

					<p className="text-brg-mid text-sm">
						Please provide your shipping details for your Miata
						Registry window sticker. Stickers are free for for a
						limited time, including shipping worldwide!
					</p>

					<form
						id="stickerForm"
						onSubmit={handleStickerSubmit}
						className="flex flex-col gap-4"
					>
						<Field id="quantity" label="Quantity" required>
							<Select
								className={SelectStyles(
									false,
									'w-32 border-brg-light text-sm'
								)}
								name="quantity"
								required
								value={quantity}
								onChange={(e) => setQuantity(e.target.value)}
								options={[
									{ value: '1', label: '1 sticker' },
									{ value: '2', label: '2 stickers' },
								]}
							/>
						</Field>

						<Field id="address" label="Shipping Address" required>
							<Location
								id="address"
								name="address"
								fullAddress
								required
								placeholder="Enter a location"
								value={selectedLocation}
								onLocationSelect={(location) =>
									setSelectedLocation(location)
								}
							/>
						</Field>
					</form>
				</div>
			) : (
				<div className="flex gap-8 min-h-[400px]">
					<div className="w-full flex flex-col items-start gap-4">
						<Button onClick={handleDownload} variant="secondary">
							Save QR code
						</Button>

						<div className="size-[228px] bg-brg-light p-6 rounded-lg">
							<QRCodeSVG
								value={qrUrl}
								size={imageSize}
								level="M"
								className="size-full qr-code"
								fgColor="#172E28"
								bgColor="transparent"
							/>
						</div>
					</div>

					<div className="w-px bg-brg-light"></div>

					<div className="flex flex-col gap-4 items-start">
						<Button
							withArrow
							variant="secondary"
							onClick={() => setShowStickerForm(true)}
						>
							Get your window sticker
						</Button>

						<div className="relative w-80 h-96 shrink-0 rounded-lg overflow-hidden">
							<img
								src="https://store.miataregistry.com/app/app/sticker.jpg"
								className="w-full h-full object-cover scale-125"
								alt="Miata Registry window sticker"
							/>

							<small className="absolute bottom-4 right-4 text-brg-light bg-black/70 px-2 py-1 rounded-lg text-xs">
								Real sticker on a real car, not a mockup!
							</small>
						</div>
					</div>
				</div>
			)}
		</Modal>
	);
}
