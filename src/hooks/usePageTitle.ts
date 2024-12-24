import { useEffect } from 'react';

export const usePageTitle = (title: string) => {
	useEffect(() => {
		const previousTitle = document.title;
		document.title = title ? `${title} – Miata Registry` : 'Miata Registry';

		return () => {
			document.title = previousTitle;
		};
	}, [title]);
};
