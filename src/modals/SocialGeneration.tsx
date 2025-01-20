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

import { useEffect, useRef, useState } from 'react';
import Symbol from '../assets/symbol.svg?react';
import { Select } from '../components/form/Select';
import { TextField } from '../components/form/TextField';
import { Modal } from '../components/Modal';
import { TCar } from '../types/Car';
import { colorMapSocial } from '../utils/car';
import { toTitleCase } from '../utils/common';
import { formatLocation } from '../utils/location';

type SocialGenerationProps = {
	isOpen: boolean;
	onClose: () => void;
	props: {
		car: TCar;
	};
};

export function SocialGeneration({
	isOpen,
	onClose,
	props,
}: SocialGenerationProps) {
	const { car } = props;
	const socialImageRef = useRef<HTMLDivElement>(null);
	const [socialText, setSocialText] = useState<string>('');
	const [imageSubtitle, setImageSubtitle] = useState<string>(
		`${car.edition?.year} ${car.edition?.name} in ${formatLocation({
			country: car.current_owner?.country || '',
			state: car.current_owner?.state,
			city: car.current_owner?.city,
		})}`
	);
	const [colorOverride, setColorOverride] = useState<string>(
		car.edition?.color?.toLowerCase() || ''
	);
	const [imageStyles, setImageStyles] = useState<string>(
		JSON.stringify({
			objectPosition: 'left bottom',
		})
	);

	const colorOptions = Object.keys(colorMapSocial).map((color) => ({
		value: color,
		label: toTitleCase(color),
	}));

	useEffect(() => {
		setSocialText(generateSocialText());
	}, [car]);

	const generateSocialText = () => {
		const text = [
			`Now listed on the Miata Registry is this ${car.edition?.year} ${car.edition?.name}`,
			car.edition?.color ? `in ${car.edition.color}` : '',
			car.current_owner?.links
				? `owned by @${JSON.parse(car.current_owner.links as string).instagram}`
				: '',
			car.current_owner?.country
				? `and located in ${formatLocation({
						country: car.current_owner.country,
						state: car.current_owner.state,
						city: car.current_owner.city,
					})}.`
				: '',
			`\n\nSee more here: https://miataregistry.com/registry/${car.id}`,
		]
			.filter(Boolean)
			.join(' ');

		return text;
	};

	const getParsedStyles = () => {
		try {
			return JSON.parse(imageStyles);
		} catch (e) {
			return {};
		}
	};

	const handleImageClick = () => {
		if (!socialImageRef.current) return;

		const cleanContent = socialImageRef.current.cloneNode(
			true
		) as HTMLElement;

		const container = cleanContent as HTMLElement;

		container.style.transform = '';
		container.style.top = '';
		container.style.left = '';
		container.style.position = '';

		let content = container.outerHTML;

		content = content
			.replace(/<img([^>]*)>/g, '<img$1/>')
			.replace(/<br([^>]*)>/g, '<br$1/>')
			.replace(/&/g, '&amp;');

		const data = `<?xml version="1.0" encoding="UTF-8"?>
			<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
				<foreignObject width="1080" height="1080">
					<div xmlns="http://www.w3.org/1999/xhtml" style="width: 1080px; height: 1080px;">
						<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
						<style>
							* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
						</style>
						${content}
					</div>
				</foreignObject>
			</svg>`;

		const blob = new Blob([data], {
			type: 'image/svg+xml;charset=utf-8',
		});

		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');

		link.href = url;
		link.download = `miata-registry-${car.id}.svg`;

		document.body.appendChild(link);

		link.click();

		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	};

	const generateSocialImage = () => {
		const activeColor =
			colorOverride || car.edition?.color?.toLowerCase() || '';

		return (
			<div
				ref={socialImageRef}
				onClick={handleImageClick}
				style={{
					width: '1080px',
					height: '1080px',
					color: colorMapSocial[activeColor],
					transform: 'scale(0.415)',
					top: '-316px',
					left: '-316px',
					position: 'absolute',
					cursor: 'pointer',
					backgroundColor: '#FFF',
				}}
			>
				<div
					style={{
						position: 'absolute',
						top: '309px',
						right: 0,
						bottom: 0,
						left: 0,
						width: '100%',
						height: '771px',
						overflow: 'hidden',
						zIndex: 0,
					}}
				>
					<img
						src={`https://store.miataregistry.com/car/${car.id}.jpg`}
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							maxWidth: 'unset',
							...getParsedStyles(),
						}}
					/>
				</div>

				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						width: '100%',
						height: '675px',
						zIndex: 1,
					}}
				>
					<svg
						width="100%"
						height="100%"
						viewBox="0 0 1080 675"
						preserveAspectRatio="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M0,0 L1080,0 L1080,309 L0,675 Z"
							fill="#E8EBEA"
						/>
					</svg>
				</div>

				<Symbol
					style={{
						width: '400px',
						height: 'auto',
						position: 'absolute',
						top: '50px',
						left: '50px',
						zIndex: 2,
					}}
				/>

				<div
					style={{
						position: 'absolute',
						top: '71px',
						right: '50px',
						border: `5px solid ${colorMapSocial[activeColor]}`,
						boxShadow: '0 4px 10px 5px rgb(23 46 40 / 0.15)',
						borderRadius: '9999px',
						height: '72px',
						padding: '5px 30px',
						fontSize: '35px',
						zIndex: 2,
					}}
				>
					{car.sequence !== null ? (
						<>
							<span style={{ opacity: 0.6 }}>
								{car.sequence &&
									car.sequence >
										(car.edition?.total_produced || 0) &&
									'Serial '}
							</span>
							<span style={{ fontWeight: 500 }}>
								#{car.sequence}
							</span>{' '}
							<span style={{ opacity: 0.6 }}>of</span>{' '}
							<span style={{ fontWeight: 500 }}>
								{(
									car.edition?.total_produced || 0
								).toLocaleString()}
							</span>
						</>
					) : (
						<>
							<span style={{ fontWeight: 500 }}>One</span>{' '}
							<span style={{ opacity: 0.6 }}>of</span>{' '}
							<span style={{ fontWeight: 500 }}>
								{(
									car.edition?.total_produced || 0
								).toLocaleString()}
							</span>
						</>
					)}
				</div>

				<div
					style={{
						position: 'absolute',
						top: '215px',
						left: '50px',
						zIndex: 2,
					}}
				>
					<h2
						style={{
							fontWeight: 500,
							fontSize: '75px',
							letterSpacing: '-0.025em',
						}}
					>
						Now on the Registry
					</h2>

					<h4
						style={{
							fontWeight: 500,
							fontSize: '40px',
							opacity: 0.6,
							width: '730px',
							lineHeight: 1.25,
							display: 'flex',
							flexWrap: 'wrap',
							rowGap: '0rem',
							columnGap: '0.75rem',
						}}
					>
						{imageSubtitle.split(' in ').map((part, index) => (
							<span key={index} style={{ whiteSpace: 'nowrap' }}>
								{index === 0 ? '' : ' in '}
								{part}
							</span>
						))}
					</h4>
				</div>
			</div>
		);
	};

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				title="Generate Social Post"
				hideCancel
			>
				<div className="flex flex-col gap-2">
					<div className="relative w-[448px] h-[448px] rounded-lg overflow-hidden">
						{generateSocialImage()}
					</div>

					<div className="flex flex-col gap-2">
						<Select
							value={colorOverride}
							onChange={(
								e: React.ChangeEvent<HTMLSelectElement>
							) => setColorOverride(e.target.value)}
							placeholder="Select Color Override"
							options={[
								{ value: '', label: 'Select Color Override' },
								...colorOptions,
							]}
						/>

						<TextField
							value={imageSubtitle}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>
							) => setImageSubtitle(e.target.value)}
							placeholder="Image Subtitle"
						/>

						<TextField
							type="textarea"
							value={socialText}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>
							) => setSocialText(e.target.value)}
							placeholder="Social Post Text"
						/>

						<TextField
							type="textarea"
							value={imageStyles}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>
							) => setImageStyles(e.target.value)}
							className="font-mono h-156"
						/>
					</div>
				</div>
			</Modal>
		</>
	);
}
