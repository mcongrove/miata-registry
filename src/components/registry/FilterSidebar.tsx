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

import { ChangeEvent, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { TFilterOption } from '../../types/Filter';
import { Select } from '../form/Select';
import { FilterHeader } from './FilterHeader';
import { FilterRadioGroup } from './FilterRadioGroup';

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

	const [editionOptions, setEditionOptions] = useState<string[]>([]);
	const [countries, setCountries] = useState<
		Array<{ value: string; label: string }>
	>([]);

	useEffect(() => {
		const loadCountries = async () => {
			const countryList = await getCountries();

			const formattedCountries = countryList.map((code: string) => ({
				value: code,
				label:
					new Intl.DisplayNames(['en'], { type: 'region' }).of(
						code
					) || code,
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

			setEditionOptions(editions.sort());
		};

		loadCountries();
		loadEditions();
	}, []);

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
								title="Year"
								onClear={() => handleClear('year')}
								hasActiveFilter={!!getActiveValue('year')}
								id="field-year"
							/>

							<div className="p-4 pt-0">
								<Select
									id="field-year"
									value={getActiveValue('year') || ''}
									onChange={(
										e: ChangeEvent<HTMLSelectElement>
									) =>
										handleSelectChange(
											e.target.value,
											'year'
										)
									}
									options={years.map((year) => ({
										value: String(year),
										label: String(year),
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
								id="field-generation"
							/>

							<div className="p-4 pt-0">
								<Select
									id="field-generation"
									value={getActiveValue('generation') || ''}
									onChange={(
										e: ChangeEvent<HTMLSelectElement>
									) =>
										handleSelectChange(
											e.target.value,
											'generation'
										)
									}
									options={['NA', 'NB', 'NC', 'ND'].map(
										(gen) => ({
											value: gen,
											label: gen,
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
									) =>
										handleSelectChange(
											e.target.value,
											'edition'
										)
									}
									options={editionOptions.map((edition) => ({
										value: edition,
										label: edition,
									}))}
									placeholder="Select edition"
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

						<FilterRadioGroup
							title="Claim Status"
							type="claimStatus"
							options={['Claimed', 'Unclaimed']}
							activeValue={getActiveValue('claimStatus')}
							onClear={handleClear}
							onChange={handleOptionChange}
						/>
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
