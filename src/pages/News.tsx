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

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

interface NewsArticle {
	created_at: number;
	excerpt: string;
	id: string;
	slug: string;
	title_short: string;
	title: string;
}

export const News = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [news, setNews] = useState<NewsArticle[]>([]);

	usePageMeta({
		path: '/news',
		title: 'News',
		description:
			'Stay up to date with the latest announcements and updates from the Registry',
	});

	useEffect(() => {
		const fetchNews = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/news`
				);

				const data = await response.json();

				setNews(data);
			} catch (error) {
				console.error('Error fetching news:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchNews();
	}, []);

	return (
		<main className="flex-1 px-8 pt-28 lg:pt-32 lg:px-0 pb-16 flex flex-col gap-16">
			<div className="container mx-auto flex flex-col gap-12">
				<div className="flex flex-col gap-2">
					<h1 className="text-4xl font-bold text-brg">
						Latest Updates
					</h1>

					<p className="text-brg-mid">
						Stay up to date with the latest announcements and
						updates from the Registry
					</p>
				</div>

				{isLoading ? (
					<div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="animate-pulse">
								<div className="aspect-video mb-4 rounded-lg bg-brg-light" />
								<div className="h-6 bg-brg-light rounded w-3/4 mb-2" />
								<div className="h-4 bg-brg-light rounded w-1/4" />
							</div>
						))}
					</div>
				) : (
					<div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
						{news.map((article) => (
							<Link
								key={article.id}
								to={`/news/${article.id}`}
								className="flex flex-col gap-6 group"
							>
								<div className="md:aspect-video rounded-xl overflow-hidden bg-brg-light border border-brg-border/40 h-60">
									<img
										src={`https://store.miataregistry.com/news/${article.id}.jpg`}
										alt={article.title}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									/>
								</div>

								<div className="flex flex-col gap-1">
									<div className="text-xs text-brg-mid/80">
										{new Date(
											article.created_at
										).toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
											year: 'numeric',
										})}
									</div>

									<h2 className="text-lg font-medium text-brg group-hover:text-brg-dark line-clamp-2">
										{article.title}
									</h2>

									<div className="mt-2 text-sm text-brg-mid/80 flex items-center">
										{article.excerpt}
									</div>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</main>
	);
};
