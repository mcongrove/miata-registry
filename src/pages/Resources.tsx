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

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import type { TResource, TResourceKind } from '../types/Resource';
import { handleApiError } from '../utils/common';
import { resourceKindIcon, resourceKindLabel } from '../utils/resource';

export const Resources = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(true);
	const [resources, setResources] = useState<TResource[]>([]);

	const kind = searchParams.get('kind') ?? '';
	const edition = searchParams.get('edition') ?? '';
	const hasPages = resources.some((resource) => resource.kind === 'page');
	const kindFilters: { value: '' | TResourceKind; label: string }[] = [
		{ value: '', label: 'All' },
		{ value: 'registry', label: 'Registries' },
		{ value: 'link', label: 'Links' },
		...(hasPages ? [{ value: 'page' as const, label: 'Pages' }] : []),
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

			try {
				const params = new URLSearchParams();

				if (edition) params.set('edition', edition);

				const query = params.toString();
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/resources${query ? `?${query}` : ''}`
				);

				const data = await response.json();

				setResources(Array.isArray(data) ? data : []);
			} catch (error) {
				handleApiError(error);
				setResources([]);
			} finally {
				setIsLoading(false);
			}
		};

		load();
	}, [edition]);

	useEffect(() => {
		if (kind === 'page' && !isLoading && !hasPages) {
			const next = new URLSearchParams(searchParams);
			next.delete('kind');
			setSearchParams(next, { replace: true });
		}
	}, [kind, hasPages, isLoading, searchParams, setSearchParams]);

	const setKind = (value: string) => {
		const next = new URLSearchParams(searchParams);

		if (value) {
			next.set('kind', value);
		} else {
			next.delete('kind');
		}

		setSearchParams(next, { replace: true });
	};

	return (
		<main className="flex-1 px-8 pt-28 lg:pt-32 lg:px-0 pb-16">
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
					<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
						<span className="text-sm font-medium text-brg shrink-0">
							Filter by kind
						</span>
						<div className="flex gap-1 p-1 bg-brg-light rounded-lg w-full sm:w-auto">
							{kindFilters.map(({ value, label }) => {
								const active = kind === value;

								return (
									<button
										key={label}
										type="button"
										onClick={() => setKind(value)}
										className={`flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
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
						{edition && (
							<button
								type="button"
								onClick={() => {
									const next = new URLSearchParams(
										searchParams
									);
									next.delete('edition');
									setSearchParams(next, { replace: true });
								}}
								className="text-sm text-brg-mid hover:text-brg"
							>
								Clear edition filter
							</button>
						)}
					</div>

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

									{!isLoading &&
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
