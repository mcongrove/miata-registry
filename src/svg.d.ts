declare module '*.svg?react' {
	import * as React from 'react';
	const SVGComponent: React.FC<React.SVGProps<SVGSVGElement>>;
	export default SVGComponent;
}
