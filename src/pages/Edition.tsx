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
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Credit } from '../components/Credit';
import { JsonLd } from '../components/JsonLd';
import {
	RecentAdditions,
	type RecentEditionCar,
} from '../components/edition/RecentAdditions';
import { Stats } from '../components/edition/Stats';
import { Chip } from '../components/rarity/Chip';
import { usePageMeta } from '../hooks/usePageMeta';
import { TEdition } from '../types/Edition';
import type { TResource } from '../types/Resource';
import { formatEditionColor } from '../utils/car';
import { handleApiError } from '../utils/common';
import { editionRegistryFilterPath } from '../utils/editionSlug';
import { editionPageJsonLd } from '../utils/jsonLd';
import { resourceKindIcon, resourceKindLabel } from '../utils/resource';

type EditionPayload = {
	edition: TEdition & { slug: string };
	cars: RecentEditionCar[];
};

export const Edition = () => {
	const { slug } = useParams<{ slug: string }>();
	const [payload, setPayload] = useState<EditionPayload | null>(null);
	const [resources, setResources] = useState<TResource[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);

	const edition = payload?.edition;
	const title = edition ? `${edition.year} ${edition.name}` : '';
	const description =
		edition?.description?.split('\n')[0] ||
		(edition
			? `${edition.year} ${edition.name} — limited edition Mazda Miata. ${edition.total_produced?.toLocaleString('en-US') ?? '—'} produced; ${edition.in_registry?.toLocaleString('en-US') ?? 0} in the Miata Registry.`
			: '');

	usePageMeta({
		path: slug ? `/registry/editions/${slug}` : '/registry/editions',
		title: notFound ? 'Edition Not Found' : title,
		description: notFound ? '' : description,
		noindex: notFound,
	});

	useEffect(() => {
		if (!slug) return;

		const load = async () => {
			setIsLoading(true);
			setNotFound(false);
			setPayload(null);
			setResources([]);

			try {
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/editions/slug/${encodeURIComponent(slug)}`
				);

				if (response.status === 404) {
					setNotFound(true);

					return;
				}

				if (!response.ok) {
					throw new Error('Failed to load edition');
				}

				const data = (await response.json()) as EditionPayload;

				setPayload(data);

				try {
					const base = import.meta.env.VITE_CLOUDFLARE_WORKER_URL;
					const [editionResponse, generationResponse] =
						await Promise.all([
							fetch(
								`${base}/resources?edition=${encodeURIComponent(data.edition.id)}`
							),
							data.edition.generation
								? fetch(
										`${base}/resources?generation=${encodeURIComponent(data.edition.generation)}`
									)
								: Promise.resolve(null),
						]);

					const editionResources: TResource[] = editionResponse.ok
						? await editionResponse.json()
						: [];
					const generationResources: TResource[] =
						generationResponse?.ok
							? await generationResponse.json()
							: [];

					const editionList = Array.isArray(editionResources)
						? editionResources
						: [];
					const generationList = Array.isArray(generationResources)
						? generationResources
						: [];
					const editionIds = new Set(
						editionList.map((resource) => resource.id)
					);

					// Gen-wide FAQ/historic shelves are too broad for an edition page.
					setResources([
						...editionList,
						...generationList.filter(
							(resource) =>
								!editionIds.has(resource.id) &&
								resource.sort_order !== 800 &&
								resource.sort_order !== 900
						),
					]);
				} catch {
					setResources([]);
				}
			} catch (error) {
				handleApiError(error);
				setNotFound(true);
				setResources([]);
			} finally {
				setIsLoading(false);
			}
		};

		load();
	}, [slug]);

	if (isLoading) {
		return (
			<main className="flex-1 pt-20">
				<div className="container mx-auto p-8 lg:p-0 lg:py-8">
					<div className="h-72 lg:h-96 bg-brg-light rounded-lg animate-pulse mb-8" />
					<div className="h-8 w-2/3 bg-brg-light rounded animate-pulse mb-4" />
					<div className="h-24 bg-brg-light rounded animate-pulse" />
				</div>
			</main>
		);
	}

	if (notFound || !edition) {
		return (
			<main className="flex-1 pt-20">
				<div className="container mx-auto p-8 lg:p-0 lg:py-16 flex flex-col items-center text-center">
					<h1 className="text-2xl font-bold mb-4">
						Edition not found
					</h1>
					<p className="text-brg-mid mb-6">
						We couldn't find that limited edition.
					</p>
					<Button
						href="/registry/editions"
						variant="secondary"
						withArrow
					>
						Browse editions
					</Button>
				</div>
			</main>
		);
	}

	const filterPath = editionRegistryFilterPath(edition.year, edition.name);
	const paragraphs = (edition.description ?? '')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);

	return (
		<main className="flex-1 pt-20">
			<JsonLd data={editionPageJsonLd(edition, payload.cars)} />

			<div className="container mx-auto p-8 lg:p-0 lg:py-8">
				<Link
					to="/registry/editions"
					className="inline-flex items-center gap-1.5 text-sm text-brg-mid hover:text-brg mb-6"
				>
					← Back to Editions
				</Link>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
					<div className="flex flex-col gap-6 self-start">
						<div>
							<p className="text-sm text-brg-mid mb-1">
								{edition.year} · {edition.generation} ·{' '}
								{formatEditionColor(edition.color)}
							</p>
							<h1 className="text-3xl lg:text-4xl font-bold text-brg">
								{edition.name}
							</h1>
						</div>

						<div className="aspect-video w-full overflow-hidden bg-brg-light rounded-lg relative">
							<img
								src={`https://store.miataregistry.com/edition/${edition.id}.jpg`}
								alt={`${edition.year} ${edition.name}`}
								className="w-full h-full object-cover"
								onError={(e) => {
									e.currentTarget.style.display = 'none';
								}}
							/>

							{(edition.rarity_score ?? 0) > 0 && (
								<div className="absolute bottom-3 left-3">
									<Chip score={edition.rarity_score ?? 0} />
								</div>
							)}

							{edition.image_car_id && (
								<div className="absolute bottom-3 right-3">
									<Credit
										id={edition.image_car_id}
										direction="left"
									/>
								</div>
							)}
						</div>

						{paragraphs.length > 0 && (
							<section>
								<h2 className="text-xl font-bold mb-4">
									About this edition
								</h2>
								<div className="space-y-4 text-brg-mid leading-relaxed">
									{paragraphs.map((paragraph, index) => (
										<p key={index}>{paragraph}</p>
									))}
								</div>
							</section>
						)}

						{resources.length > 0 && (
							<section>
								<div className="flex items-baseline justify-between gap-4 mb-4">
									<h2 className="text-xl font-bold">
										Resources
									</h2>
									<Link
										to={`/resources?edition=${encodeURIComponent(edition.id)}`}
										className="text-sm text-brg-mid hover:text-brg"
									>
										View all
									</Link>
								</div>
								<ul className="flex flex-col divide-y divide-brg-light border-y border-brg-light">
									{resources.map((resource) => (
										<li key={resource.id}>
											<Link
												to={`/resources/${resource.id}`}
												className="flex items-start justify-between gap-3 py-4 group"
											>
												<div className="flex gap-3 min-w-0">
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
													<div className="flex flex-col gap-0.5 min-w-0">
														<span className="text-sm font-medium text-brg group-hover:text-brg-dark">
															{resource.title}
														</span>
														<p className="text-sm text-brg-mid line-clamp-2">
															{resource.summary}
														</p>
													</div>
												</div>
												<span className="text-brg-mid text-sm shrink-0 mt-1.5 group-hover:text-brg">
													→
												</span>
											</Link>
										</li>
									))}
								</ul>
							</section>
						)}
					</div>

					<div className="flex flex-col gap-6 lg:min-h-full">
						<Stats edition={edition} />

						<RecentAdditions
							cars={payload.cars}
							editionLabel={title}
							totalProduced={edition.total_produced}
							viewAllTo={filterPath}
						/>
					</div>
				</div>
			</div>
		</main>
	);
};
