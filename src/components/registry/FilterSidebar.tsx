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

import { ChangeEvent, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { TFilterOption } from '../../types/Filter';
import { formatRarityLevel, RARITY_LEVELS } from '../../utils/car';
import { getCountryDisplayName } from '../../utils/location';
import { Select } from '../form/Select';
import { TextField } from '../form/TextField';
import { FilterHeader } from './FilterHeader';

const getCountries = async () => {
	const response = await fetch(
		`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/owners/countries`
	);

	return response.json();
};

const getEditionNames = async () => {
	const response = await fetch(
		`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/editions/names`
	);

	return response.json();
};

interface FilterSidebarProps {
	className?: string;
	activeFilters: TFilterOption[];
	onFiltersChange: (filters: TFilterOption[]) => void;
	onClose?: () => void;
	isOpen?: boolean;
}

export const FilterSidebar = ({
	className = '',
	activeFilters,
	onFiltersChange,
	onClose,
	isOpen = false,
}: FilterSidebarProps) => {
	const currentYear = new Date().getFullYear();
	const years = Array.from(
		{ length: currentYear - 1989 + 1 },
		(_, i) => currentYear - i
	).reverse();

	const [editionOptions, setEditionOptions] = useState<
		Array<{
			count: number;
			generation: string;
			name: string;
			year: number;
		}>
	>([]);
	const [countries, setCountries] = useState<
		Array<{ value: string; label: string }>
	>([]);

	useEffect(() => {
		const loadCountries = async () => {
			const countryList = await getCountries();

			const formattedCountries = countryList.map((code: string) => ({
				value: code,
				label: getCountryDisplayName(code),
			}));

			setCountries(
				formattedCountries.sort(
					(a: { label: string }, b: { label: string }) =>
						a.label.localeCompare(b.label)
				)
			);
		};

		const loadEditions = async () => {
			const editions = await getEditionNames();

			setEditionOptions(
				editions.sort((a: { name: string }, b: { name: string }) =>
					a.name.localeCompare(b.name)
				)
			);
		};

		loadCountries();
		loadEditions();
	}, []);

	useEffect(() => {
		if (!editionOptions.length) return;

		const editionName = activeFilters.find((f) => f.type === 'edition')
			?.value;
		if (!editionName) return;

		const edition = editionOptions.find((e) => e.name === editionName);
		if (!edition) return;

		const yearOk =
			activeFilters.find((f) => f.type === 'year')?.value ===
			String(edition.year);
		const genOk =
			activeFilters.find((f) => f.type === 'generation')?.value ===
			edition.generation;
		if (yearOk && genOk) return;

		const next = activeFilters.filter(
			(f) => f.type !== 'year' && f.type !== 'generation'
		);
		next.push(
			{ type: 'year', value: String(edition.year) },
			{ type: 'generation', value: edition.generation }
		);
		onFiltersChange(next);
	}, [editionOptions, activeFilters, onFiltersChange]);

	const getActiveValue = (type: TFilterOption['type']) =>
		activeFilters.find((f) => f.type === type)?.value;

	const handleOptionChange = (newOption: TFilterOption) => {
		const otherTypeFilters = activeFilters.filter(
			(f) => f.type !== newOption.type
		);
		if (newOption.value !== '') {
			onFiltersChange([...otherTypeFilters, newOption]);
		} else {
			onFiltersChange(otherTypeFilters);
		}
	};

	const handleClear = (filterType: string) => {
		onFiltersChange(activeFilters.filter((f) => f.type !== filterType));
	};

	const handleSelectChange = (value: string, type: TFilterOption['type']) => {
		handleOptionChange({ type, value });
	};

	const findEdition = (displayName: string) =>
		editionOptions.find((e) => e.name === displayName);

	const activeYear = getActiveValue('year');
	const activeGeneration = getActiveValue('generation');
	const activeEdition = getActiveValue('edition');

	const editionsForYearGen = editionOptions.filter((edition) => {
		if (activeYear && String(edition.year) !== activeYear) {
			return false;
		}
		if (activeGeneration && edition.generation !== activeGeneration) {
			return false;
		}
		return true;
	});

	const yearsWithEditions = new Set(
		editionOptions
			.filter(
				(edition) =>
					!activeGeneration ||
					edition.generation === activeGeneration
			)
			.map((edition) => edition.year)
	);

	const generationsWithEditions = new Set(
		editionOptions
			.filter(
				(edition) =>
					!activeYear || String(edition.year) === activeYear
			)
			.map((edition) => edition.generation)
	);

	const handleYearChange = (value: string) => {
		let next = activeFilters.filter((f) => f.type !== 'year');
		if (value) {
			const edition = activeEdition ? findEdition(activeEdition) : null;
			if (edition && String(edition.year) !== value) {
				next = next.filter((f) => f.type !== 'edition');
			}
			next.push({ type: 'year', value });
		}
		onFiltersChange(next);
	};

	const handleGenerationChange = (value: string) => {
		let next = activeFilters.filter((f) => f.type !== 'generation');
		if (value) {
			const edition = activeEdition ? findEdition(activeEdition) : null;
			if (edition && edition.generation !== value) {
				next = next.filter((f) => f.type !== 'edition');
			}
			next.push({ type: 'generation', value });
		}
		onFiltersChange(next);
	};

	const handleEditionChange = (value: string) => {
		let next = activeFilters.filter((f) => f.type !== 'edition');
		if (!value) {
			onFiltersChange(next);
			return;
		}

		const edition = findEdition(value);
		next = next.filter(
			(f) => f.type !== 'year' && f.type !== 'generation'
		);
		next.push({ type: 'edition', value });
		if (edition) {
			next.push(
				{ type: 'year', value: String(edition.year) },
				{ type: 'generation', value: edition.generation }
			);
		}
		onFiltersChange(next);
	};

	const taxonomyLocked = !!activeEdition;

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	const hasActiveFilters = activeFilters.length > 0;

	const handleClearAll = () => {
		onFiltersChange([]);
	};

	return (
		<>
			<div
				className={twMerge(
					'fixed lg:relative inset-y-0 top-20 lg:top-0 left-0 z-50 lg:z-auto w-64 lg:translate-x-0 transition-transform duration-300 overflow-y-auto max-h-[calc(100vh-5rem)] lg:max-h-full',
					isOpen ? 'translate-x-0' : '-translate-x-full',
					className
				)}
			>
				<div className="flex flex-col h-full lg:border lg:rounded-md border-brg-light shadow-2xl lg:shadow-none bg-white">
					<div className="lg:hidden flex items-center justify-between p-3 pr-4 border-b border-brg-light">
						<h2 className="text-sm font-semibold">Filters</h2>

						<div className="flex items-center gap-1">
							{hasActiveFilters && (
								<button
									onClick={handleClearAll}
									className="px-2 py-1 text-xs text-brg-mid hover:text-red-700"
								>
									Clear All
								</button>
							)}

							<button
								onClick={onClose}
								className="text-brg-mid hover:text-brg"
							>
								<i className="fa-solid fa-times"></i>
							</button>
						</div>
					</div>

					<div className="flex-1 divide-y divide-brg-light">
						<div>
							<FilterHeader
								title="Search"
								onClear={() => handleClear('search')}
								hasActiveFilter={!!getActiveValue('search')}
								id="field-search"
							/>

							<div className="p-4 pt-0">
								<TextField
									id="field-search"
									value={getActiveValue('search') || ''}
									onChange={(
										e: ChangeEvent<HTMLInputElement>
									) =>
										handleSelectChange(
											e.target.value,
											'search'
										)
									}
									placeholder="VIN or Owner name"
									className="md:!text-xs"
								/>
							</div>
						</div>

						<div>
							<FilterHeader
								title="Year"
								onClear={() => handleClear('year')}
								hasActiveFilter={!!getActiveValue('year')}
								hideClear={taxonomyLocked}
								id="field-year"
							/>

							<div className="p-4 pt-0">
								<Select
									id="field-year"
									value={getActiveValue('year') || ''}
									disabled={taxonomyLocked}
									onChange={(
										e: ChangeEvent<HTMLSelectElement>
									) => handleYearChange(e.target.value)}
									options={years.map((year) => ({
										value: String(year),
										label: String(year),
										disabled: !yearsWithEditions.has(year),
									}))}
									placeholder="Select year"
									className="md:!text-xs"
								/>
							</div>
						</div>

						<div>
							<FilterHeader
								title="Generation"
								onClear={() => handleClear('generation')}
								hasActiveFilter={!!getActiveValue('generation')}
								hideClear={taxonomyLocked}
								id="field-generation"
							/>

							<div className="p-4 pt-0">
								<Select
									id="field-generation"
									value={getActiveValue('generation') || ''}
									disabled={taxonomyLocked}
									onChange={(
										e: ChangeEvent<HTMLSelectElement>
									) => handleGenerationChange(e.target.value)}
									options={['NA', 'NB', 'NC', 'ND'].map(
										(gen) => ({
											value: gen,
											label: gen,
											disabled:
												!generationsWithEditions.has(
													gen
												),
										})
									)}
									placeholder="Select generation"
									className="md:!text-xs"
								/>
							</div>
						</div>

						<div>
							<FilterHeader
								id="field-edition"
								title="Edition"
								onClear={() => handleClear('edition')}
								hasActiveFilter={!!getActiveValue('edition')}
							/>

							<div className="p-4 pt-0">
								<Select
									id="field-edition"
									value={getActiveValue('edition') || ''}
									onChange={(
										e: ChangeEvent<HTMLSelectElement>
									) => handleEditionChange(e.target.value)}
									options={editionsForYearGen.map(
										(edition) => ({
											value: edition.name,
											label: edition.name,
											disabled: edition.count === 0,
										})
									)}
									placeholder="Select edition"
									className="md:!text-xs"
								/>
							</div>
						</div>

						<div>
							<FilterHeader
								title="Rarity"
								onClear={() => handleClear('rarity')}
								hasActiveFilter={!!getActiveValue('rarity')}
								id="field-rarity"
							/>

							<div className="p-4 pt-0">
								<Select
									id="field-rarity"
									value={getActiveValue('rarity') || ''}
									onChange={(
										e: ChangeEvent<HTMLSelectElement>
									) =>
										handleSelectChange(
											e.target.value,
											'rarity'
										)
									}
									options={RARITY_LEVELS.map((level) => ({
										value: level,
										label: formatRarityLevel(level),
									}))}
									placeholder="Select rarity"
									className="md:!text-xs"
								/>
							</div>
						</div>

						<div>
							<FilterHeader
								title="Country"
								onClear={() => handleClear('country')}
								hasActiveFilter={!!getActiveValue('country')}
								id="field-country"
							/>

							<div className="p-4 pt-0">
								<Select
									id="field-country"
									value={getActiveValue('country') || ''}
									onChange={(
										e: ChangeEvent<HTMLSelectElement>
									) =>
										handleSelectChange(
											e.target.value,
											'country'
										)
									}
									options={countries}
									placeholder="Select country"
									className="md:!text-xs"
								/>
							</div>
						</div>

						<div>
							<FilterHeader
								title="Claim Status"
								onClear={() => handleClear('claimStatus')}
								hasActiveFilter={!!getActiveValue('claimStatus')}
								id="field-claim-status"
							/>

							<div className="p-4 pt-0">
								<Select
									id="field-claim-status"
									value={getActiveValue('claimStatus') || ''}
									onChange={(
										e: ChangeEvent<HTMLSelectElement>
									) =>
										handleSelectChange(
											e.target.value,
											'claimStatus'
										)
									}
									options={[
										{ value: 'Claimed', label: 'Claimed' },
										{
											value: 'Unclaimed',
											label: 'Unclaimed',
										},
									]}
									placeholder="Any"
									className="md:!text-xs"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Overlay for mobile */}
			{onClose && (
				<div
					className={twMerge(
						'fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300',
						isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
					)}
					onClick={onClose}
					aria-hidden="true"
				/>
			)}
		</>
	);
};
