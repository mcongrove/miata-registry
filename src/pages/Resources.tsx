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

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import type { TResource, TResourceKind } from '../types/Resource';
import { handleApiError } from '../utils/common';
import { resourceKindIcon, resourceKindLabel } from '../utils/resource';

const GENERATION_OPTIONS = [
	{ value: '', label: 'All generations' },
	{ value: 'NA', label: 'NA (1989–1997)' },
	{ value: 'NB', label: 'NB (1998–2005)' },
	{ value: 'NC', label: 'NC (2006–2015)' },
	{ value: 'ND', label: 'ND (2016–present)' },
];

const SELECT_CLASS =
	"shrink-0 px-3 py-2 text-[16px] md:text-sm border border-brg-light rounded-lg bg-white text-brg focus:outline-none focus:border-brg-mid appearance-none cursor-pointer [background-position:right_0.5rem_center] bg-no-repeat bg-[length:1rem] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%235D6D69%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] pr-8";

export const Resources = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(true);
	const [resources, setResources] = useState<TResource[]>([]);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const q = searchParams.get('q') ?? '';
	const kind = searchParams.get('kind') ?? '';
	const edition = searchParams.get('edition') ?? '';
	const generation = searchParams.get('generation') ?? '';
	const kindFilters: { value: '' | TResourceKind; label: string }[] = [
		{ value: '', label: 'All' },
		{ value: 'registry', label: 'Registries' },
		{ value: 'link', label: 'Links' },
	];
	const visibleResources = kind
		? resources.filter((resource) => resource.kind === kind)
		: resources;

	usePageMeta({
		path: '/resources',
		title: 'Resources',
		description:
			'Historical documentation for limited edition Miatas, preserved for the long term, including archives of community registries whose data now lives on in the Miata Registry.',
	});

	useEffect(() => {
		const load = async () => {
			setIsLoading(true);
			setFetchError(null);

			try {
				const params = new URLSearchParams();

				if (q) params.set('q', q);
				if (edition) params.set('edition', edition);
				if (generation) params.set('generation', generation);

				const query = params.toString();
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/resources${query ? `?${query}` : ''}`
				);

				if (!response.ok) {
					throw new Error('Failed to load resources');
				}

				const data = await response.json();

				setResources(Array.isArray(data) ? data : []);
			} catch (error) {
				handleApiError(error);
				setFetchError(
					'Unable to load resources. Please try again later.'
				);
				setResources([]);
			} finally {
				setIsLoading(false);
			}
		};

		load();
	}, [q, edition, generation]);

	const setParam = (key: 'kind' | 'generation', value: string) => {
		const next = new URLSearchParams(searchParams);

		if (value) {
			next.set(key, value);
		} else {
			next.delete(key);
		}

		setSearchParams(next, { replace: true });
	};

	const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const searchValue = (formData.get('search') as string)?.trim() ?? '';
		const next = new URLSearchParams(searchParams);

		if (searchValue) {
			next.set('q', searchValue);
		} else {
			next.delete('q');
		}

		setSearchParams(next, { replace: true });
	};

	const clearFilters = () => {
		setSearchParams(new URLSearchParams(), { replace: true });

		if (searchInputRef.current) {
			searchInputRef.current.value = '';
		}
	};

	const hasActiveFilters = Boolean(q || edition || generation || kind);

	return (
		<main className="flex-1 pt-28 lg:pt-32 pb-16">
			<div className="container mx-auto flex flex-col gap-12">
				<div className="flex flex-col gap-2">
					<h1 className="text-4xl font-bold text-brg">Resources</h1>
					<p className="text-brg-mid text-pretty max-w-3xl">
						Historical documentation for limited edition Miatas,
						gathered so the record survives when original sites
						disappear: production notes, VIN lists, and archives of
						community registries. Where we could, data from defunct
						registries was brought into the Miata Registry itself so
						it remains publicly inspectable and backed up for the
						long term.
					</p>
				</div>

				<div className="flex flex-col gap-4">
					<form
						onSubmit={handleSearch}
						className="flex flex-col xl:flex-row xl:items-center gap-2"
					>
						<div className="relative flex-1 min-w-0 xl:max-w-sm">
							<input
								ref={searchInputRef}
								type="search"
								name="search"
								defaultValue={q}
								placeholder="Search resources..."
								className="w-full pl-9 pr-3 py-2 text-[16px] md:text-sm border border-brg-light rounded-lg text-brg focus:outline-none focus:border-brg-mid"
							/>
							<i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-brg-mid/60 text-sm" />
						</div>

						<select
							value={generation}
							onChange={(e) =>
								setParam('generation', e.target.value)
							}
							className={SELECT_CLASS}
							aria-label="Filter by generation"
						>
							{GENERATION_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>

						<div className="flex items-center gap-2 min-w-0 flex-1">
							<div className="flex gap-1 p-1 bg-brg-light rounded-lg min-w-0 overflow-x-auto">
								{kindFilters.map(({ value, label }) => {
									const active = kind === value;

									return (
										<button
											key={label}
											type="button"
											onClick={() =>
												setParam('kind', value)
											}
											className={`shrink-0 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
												active
													? 'bg-white text-brg shadow-sm'
													: 'text-brg-mid hover:text-brg'
											}`}
										>
											{label}
										</button>
									);
								})}
							</div>

							{hasActiveFilters && (
								<button
									type="button"
									onClick={clearFilters}
									className="shrink-0 text-sm text-brg-mid hover:text-brg whitespace-nowrap"
								>
									Clear
								</button>
							)}
						</div>
					</form>

					<div className="bg-white rounded-md border border-brg-light overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full border-collapse text-sm">
								<thead>
									<tr className="bg-brg-light text-left text-brg">
										<th className="px-3 py-2 font-medium">
											Title
										</th>
										<th className="px-3 py-2 font-medium">
											Summary
										</th>
									</tr>
								</thead>
								<tbody>
									{isLoading
										? [...Array(6)].map((_, i) => (
												<tr
													key={i}
													className="border-t border-brg-light animate-pulse"
												>
													<td className="px-3 py-2">
														<div className="flex items-center gap-3">
															<div className="size-8 rounded-lg bg-brg-light shrink-0" />
															<div className="h-4 bg-brg-light rounded w-40" />
														</div>
													</td>
													<td className="px-3 py-2">
														<div className="h-4 bg-brg-light rounded w-64" />
													</td>
												</tr>
											))
										: null}

									{!isLoading && fetchError ? (
										<tr>
											<td
												colSpan={2}
												className="px-3 py-8 text-center"
											>
												<div className="flex flex-col items-center gap-2">
													<i className="fa-solid fa-exclamation-triangle text-2xl text-red-500" />
													<p className="text-red-700">
														{fetchError}
													</p>
													<button
														type="button"
														onClick={() =>
															window.location.reload()
														}
														className="text-sm text-brg hover:underline"
													>
														Try again
													</button>
												</div>
											</td>
										</tr>
									) : null}

									{!isLoading &&
									!fetchError &&
									visibleResources.length === 0 ? (
										<tr>
											<td
												colSpan={2}
												className="px-3 py-8 text-brg-mid text-center"
											>
												No resources match this filter.
											</td>
										</tr>
									) : null}

									{!isLoading &&
										!fetchError &&
										visibleResources.map((resource) => (
											<tr
												key={resource.id}
												onClick={() =>
													navigate(
														`/resources/${resource.id}`
													)
												}
												className="border-t border-brg-light cursor-pointer hover:bg-brg-light/40 transition-colors"
											>
												<td className="px-3 py-2 align-middle">
													<div className="flex items-center gap-3 min-w-0">
														<span
															className="flex size-8 items-center justify-center rounded-lg bg-brg-light text-brg-mid shrink-0"
															title={resourceKindLabel(
																resource.kind
															)}
														>
															<i
																className={`${resourceKindIcon(resource.kind)} text-xs`}
																aria-hidden
															/>
															<span className="sr-only">
																{resourceKindLabel(
																	resource.kind
																)}
															</span>
														</span>
														<span className="font-medium text-brg truncate">
															{resource.title}
														</span>
													</div>
												</td>
												<td className="px-3 py-2 align-middle text-brg-mid">
													<span className="line-clamp-1">
														{resource.featured ? (
															<i
																className="fa-solid fa-fw fa-star text-yellow-500 mr-1.5"
																title="Featured"
																aria-label="Featured"
															/>
														) : null}
														{resource.file_key ? (
															<i
																className="fa-solid fa-fw fa-download text-brg-mid/40 mr-1.5"
																title="Download available"
																aria-label="Download available"
															/>
														) : null}
														{resource.summary}
													</span>
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};
