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

const MARKER_APP1 = 0xffe1;
const MARKER_APP13 = 0xffed;
const MARKER_COM = 0xfffe;
const MARKER_SOS = 0xffda;

function concatParts(parts: Uint8Array[]): Uint8Array {
	const total = parts.reduce((sum, part) => sum + part.length, 0);
	const out = new Uint8Array(total);
	let offset = 0;
	for (const part of parts) {
		out.set(part, offset);
		offset += part.length;
	}
	return out;
}

function shouldDropMarker(marker: number): boolean {
	return (
		marker === MARKER_APP1 ||
		marker === MARKER_APP13 ||
		marker === MARKER_COM
	);
}

export function stripJpegMetadata(input: ArrayBuffer | Uint8Array): Uint8Array {
	const src = input instanceof Uint8Array ? input : new Uint8Array(input);

	if (src.length < 2 || src[0] !== 0xff || src[1] !== 0xd8) {
		return src;
	}

	const parts: Uint8Array[] = [src.subarray(0, 2)];
	let offset = 2;

	try {
		while (offset < src.length) {
			if (src[offset] !== 0xff) {
				return src;
			}

			const markerStart = offset;
			offset += 1;

			while (offset < src.length && src[offset] === 0xff) {
				offset += 1;
			}

			if (offset >= src.length) {
				return src;
			}

			const markerByte = src[offset];
			offset += 1;
			const marker = 0xff00 | markerByte;

			// RSTn and TEM have no length field (not expected before SOS in headers)
			if (
				markerByte === 0x01 ||
				(markerByte >= 0xd0 && markerByte <= 0xd7)
			) {
				parts.push(src.subarray(markerStart, offset));
				continue;
			}

			if (markerByte === 0xd8 || markerByte === 0xd9) {
				parts.push(src.subarray(markerStart, src.length));
				return concatParts(parts);
			}

			if (offset + 2 > src.length) {
				return src;
			}

			const segmentLength = (src[offset] << 8) | src[offset + 1];
			if (segmentLength < 2) {
				return src;
			}

			const segmentEnd = markerStart + 2 + segmentLength;
			if (segmentEnd > src.length) {
				return src;
			}

			if (marker === MARKER_SOS) {
				parts.push(src.subarray(markerStart, src.length));
				return concatParts(parts);
			}

			if (!shouldDropMarker(marker)) {
				parts.push(src.subarray(markerStart, segmentEnd));
			}

			offset = segmentEnd;
		}
	} catch {
		return src;
	}

	return concatParts(parts);
}
