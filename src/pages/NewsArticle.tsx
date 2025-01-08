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
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { usePageMeta } from '../hooks/usePageMeta';

interface NewsArticle {
	body: string;
	created_at: number;
	excerpt: string;
	id: string;
	title: string;
}

export const NewsArticle = () => {
	const { id } = useParams();
	const [article, setArticle] = useState<NewsArticle | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	usePageMeta({
		path: `/news/${id}`,
		title: article?.title || 'News',
		description: article?.excerpt || '',
	});

	useEffect(() => {
		const fetchArticle = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_CLOUDFLARE_WORKER_URL}/news/${id}`
				);

				const data = await response.json();

				setArticle(data);
			} catch (error) {
				console.error('Error fetching article:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchArticle();
	}, [id]);

	if (isLoading) {
		return (
			<main className="flex-1 px-8 pt-24 lg:pt-32 lg:px-0 pb-16">
				<div className="container mx-auto">
					<div className="animate-pulse max-w-4xl">
						<div className="h-8 bg-brg-light rounded w-3/4 mb-4" />
						<div className="h-4 bg-brg-light rounded w-1/4 mb-8" />
						<div className="aspect-video rounded-lg bg-brg-light mb-8" />
						<div className="space-y-4">
							<div className="h-4 bg-brg-light rounded w-full" />
							<div className="h-4 bg-brg-light rounded w-5/6" />
							<div className="h-4 bg-brg-light rounded w-4/6" />
						</div>
					</div>
				</div>
			</main>
		);
	}

	if (!article) {
		return (
			<main className="flex-1 px-8 pt-24 lg:pt-40 lg:px-0 pb-16">
				<div className="container mx-auto flex flex-col items-center gap-4">
					<h1 className="text-2xl font-bold text-brg">
						Article Not Found
					</h1>

					<p className="text-brg-mid mb-4">
						The article you're looking for doesn't exist or has been
						removed.
					</p>

					<Link to="/news">
						<Button>← Back to News</Button>
					</Link>
				</div>
			</main>
		);
	}

	return (
		<main className="flex-1 px-8 pt-24 lg:pt-32 lg:px-0 pb-16">
			<div className="container mx-auto">
				<div className="flex flex-col gap-6 max-w-4xl">
					<div className="flex flex-col gap-6">
						<Link
							to="/news"
							className="text-sm w-fit py-2 px-4 -ml-4 text-brg-mid hover:text-brg inline-block"
						>
							← Back to News
						</Link>

						<div className="flex flex-col gap-1">
							<h1 className="text-4xl font-bold text-brg">
								{article.title}
							</h1>

							<div className="text-sm text-brg-mid">
								{new Date(
									article.created_at
								).toLocaleDateString('en-US', {
									month: 'long',
									day: 'numeric',
									year: 'numeric',
								})}
							</div>
						</div>
					</div>

					<div className="prose max-w-none text-xl font-light text-brg-mid">
						<ReactMarkdown>
							{article.body.split('\n')[0]}
						</ReactMarkdown>
					</div>

					<div className="aspect-video rounded-xl overflow-hidden bg-brg-light border border-brg-border/40">
						<img
							src={`https://store.miataregistry.com/news/${article.id}.jpg`}
							alt={article.title}
							className="w-full h-full object-cover"
						/>
					</div>

					<div className="prose max-w-none [&>div>p:first-child]:mt-0 [&>div:last-child>p:last-child]:mb-0">
						{article.body
							.split('\n')
							.slice(1)
							.map((paragraph, index) => (
								<ReactMarkdown
									key={index}
									className="text-brg-mid"
								>
									{paragraph}
								</ReactMarkdown>
							))}
					</div>

					<Link
						to="/registry/63621393-a540-46b5-b9fe-9231fea2730f"
						className="w-fit text-xs font-medium text-brg hover:text-brg-dark"
					>
						<h4>— &nbsp;Matthew Congrove</h4>
						<h5>
							<span className="opacity-0">— &nbsp;</span>1991 BRG
							#182
						</h5>
					</Link>
				</div>
			</div>
		</main>
	);
};
