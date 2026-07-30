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
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { JsonLd } from '../components/JsonLd';
import { usePageMeta } from '../hooks/usePageMeta';
import type { TResource } from '../types/Resource';
import { handleApiError } from '../utils/common';
import { resourcePageJsonLd } from '../utils/jsonLd';
import {
	formatFileBytes,
	formatLastAcquired,
	isExternalResourceKind,
	RESOURCE_OUTBOUND_REL,
	resourceCdnUrl,
	resourceKindLabel,
} from '../utils/resource';

export const Resource = () => {
	const { id } = useParams<{ id: string }>();
	const [resource, setResource] = useState<TResource | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	usePageMeta({
		path: id ? `/resources/${id}` : '/resources',
		title: resource?.title || 'Resource',
		description: resource?.summary || '',
	});

	useEffect(() => {
		if (!id) return;

		const load = async () => {
			setIsLoading(true);

			try {
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/resources/${encodeURIComponent(id)}`
				);

				const data = await response.json();

				if (!response.ok || data.error) {
					throw new Error(data.error || 'Resource not found');
				}

				setResource(data);
			} catch (error) {
				handleApiError(error);
				setResource(null);
			} finally {
				setIsLoading(false);
			}
		};

		load();
	}, [id]);

	if (isLoading) {
		return (
			<main className="flex-1 pt-20">
				<div className="container mx-auto p-8 lg:p-0 lg:py-8">
					<div className="h-4 w-40 bg-brg-light rounded animate-pulse mb-6" />
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
						<div className="flex flex-col gap-4">
							<div className="h-4 w-24 bg-brg-light rounded animate-pulse" />
							<div className="h-10 w-3/4 bg-brg-light rounded animate-pulse" />
							<div className="h-20 bg-brg-light rounded animate-pulse" />
						</div>
						<div className="h-40 bg-brg-light rounded animate-pulse" />
					</div>
				</div>
			</main>
		);
	}

	if (!resource) {
		return (
			<main className="flex-1 pt-20">
				<div className="container mx-auto p-8 lg:p-0 lg:py-16 flex flex-col items-center text-center">
					<h1 className="text-2xl font-bold mb-4">
						Resource not found
					</h1>
					<p className="text-brg-mid mb-6">
						That resource doesn't exist or isn't published yet.
					</p>
					<Button href="/resources" variant="secondary" withArrow>
						Browse resources
					</Button>
				</div>
			</main>
		);
	}

	const fileUrl = resource.file_key
		? resourceCdnUrl(resource.file_key)
		: null;
	const fileSize = formatFileBytes(resource.file_bytes);
	const lastAcquired = fileUrl
		? formatLastAcquired(resource.updated_at)
		: null;
	const isExternalLink =
		isExternalResourceKind(resource.kind) &&
		Boolean(resource.href?.startsWith('http'));
	const isInternalPage =
		resource.kind === 'page' && Boolean(resource.href?.startsWith('/'));
	const openLabel =
		resource.kind === 'registry' ? 'Open registry' : 'Open link';
	const editionAssociations = resource.associations.filter(
		(association) => association.type === 'edition'
	);
	const generationAssociations = resource.associations.filter(
		(association) => association.type === 'generation'
	);
	const otherAssociations = resource.associations.filter(
		(association) =>
			association.type !== 'edition' && association.type !== 'generation'
	);

	return (
		<main className="flex-1 pt-20">
			<JsonLd data={resourcePageJsonLd(resource)} />

			<div className="container mx-auto p-8 lg:p-0 lg:py-8">
				<Link
					to="/resources"
					className="inline-flex items-center gap-1.5 text-sm text-brg-mid hover:text-brg mb-6"
				>
					← Back to Resources
				</Link>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
					<div className="flex flex-col gap-6 self-start">
						<div>
							<p className="text-sm text-brg-mid mb-1">
								{resourceKindLabel(resource.kind)}
							</p>
							<h1 className="text-3xl lg:text-4xl font-bold text-brg text-balance">
								{resource.title}
							</h1>
						</div>

						<p className="text-brg-mid leading-relaxed text-pretty">
							{resource.summary}
						</p>

						{resource.body ? (
							<section>
								<h2 className="text-xl font-bold mb-4">
									About this resource
								</h2>
								<div className="prose prose-brg max-w-none text-brg-mid leading-relaxed">
									<ReactMarkdown>
										{resource.body}
									</ReactMarkdown>
								</div>
							</section>
						) : null}
					</div>

					<div className="flex flex-col gap-6 lg:min-h-full">
						{(isExternalLink || fileUrl || isInternalPage) && (
							<div className="flex flex-wrap gap-3">
								{isExternalLink && resource.href ? (
									<a
										href={resource.href}
										target="_blank"
										rel={RESOURCE_OUTBOUND_REL}
										className="group inline-flex items-center justify-center font-medium text-sm lg:text-base py-2 px-3 lg:py-3 lg:px-4 rounded-lg transition-colors bg-brg hover:bg-brg/90 text-white"
									>
										{openLabel}
										<span className="ml-2 text-sm group-hover:translate-x-0.5 transition-transform">
											→
										</span>
									</a>
								) : null}

								{fileUrl ? (
									<a
										href={fileUrl}
										target="_blank"
										rel={RESOURCE_OUTBOUND_REL}
										className={`group inline-flex items-center justify-center font-medium text-sm lg:text-base py-2 px-3 lg:py-3 lg:px-4 rounded-lg transition-colors text-white ${
											isExternalLink
												? 'bg-brg-mid hover:bg-brg-mid/90'
												: 'bg-brg hover:bg-brg/90'
										}`}
									>
										<i
											className="fa-solid fa-fw fa-download mr-2"
											aria-hidden
										/>
										Download
										{fileSize ? ` (${fileSize})` : ''}
									</a>
								) : null}

								{isInternalPage && resource.href ? (
									<Button href={resource.href} withArrow>
										Open page
									</Button>
								) : null}
							</div>
						)}

						{(lastAcquired || resource.file_name) && (
							<section className="flex flex-col gap-3">
								<h2 className="text-xl font-bold">Details</h2>
								<dl className="flex flex-col divide-y divide-brg-light border-y border-brg-light text-sm">
									{lastAcquired ? (
										<div className="flex justify-between gap-4 py-3">
											<dt className="text-brg-mid">
												Last acquired
											</dt>
											<dd className="text-brg font-medium text-right">
												{lastAcquired}
											</dd>
										</div>
									) : null}
									{resource.file_name ? (
										<div className="flex justify-between gap-4 py-3">
											<dt className="text-brg-mid">
												File
											</dt>
											<dd className="text-brg font-medium text-right break-all">
												{resource.file_name}
												{fileSize
													? ` (${fileSize})`
													: ''}
											</dd>
										</div>
									) : null}
								</dl>
							</section>
						)}

						{editionAssociations.length > 0 && (
							<section className="flex flex-col gap-4">
								<h2 className="text-xl font-bold">
									Related editions
								</h2>
								<ul className="flex flex-col divide-y divide-brg-light border-y border-brg-light">
									{editionAssociations.map((association) => {
										const label =
											association.label ||
											association.value;
										const key = `${association.type}:${association.value}`;

										if (association.slug) {
											return (
												<li key={key}>
													<Link
														to={`/registry/editions/${association.slug}`}
														className="flex items-center justify-between gap-3 py-4 group"
													>
														<span className="text-sm font-medium text-brg group-hover:text-brg-dark">
															{label}
														</span>
														<span className="text-brg-mid text-sm group-hover:text-brg">
															→
														</span>
													</Link>
												</li>
											);
										}

										return (
											<li
												key={key}
												className="py-4 text-sm font-medium text-brg"
											>
												{label}
											</li>
										);
									})}
								</ul>
							</section>
						)}

						{generationAssociations.length > 0 && (
							<section className="flex flex-col gap-3">
								<h2 className="text-xl font-bold">
									Related generations
								</h2>
								<div className="flex flex-wrap gap-2">
									{generationAssociations.map(
										(association) => (
											<span
												key={`${association.type}:${association.value}`}
												className="text-sm px-3 py-1.5 rounded-lg bg-brg-light text-brg-mid"
											>
												{association.label ||
													association.value}
											</span>
										)
									)}
								</div>
							</section>
						)}

						{otherAssociations.length > 0 && (
							<section className="flex flex-col gap-3">
								<h2 className="text-xl font-bold">Also</h2>
								<div className="flex flex-wrap gap-2">
									{otherAssociations.map((association) => (
										<span
											key={`${association.type}:${association.value}`}
											className="text-sm px-3 py-1.5 rounded-lg bg-brg-light text-brg-mid"
										>
											{association.label ||
												association.value}
										</span>
									))}
								</div>
							</section>
						)}
					</div>
				</div>
			</div>
		</main>
	);
};
