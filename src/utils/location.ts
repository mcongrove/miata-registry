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

import { TLocation } from '../types/Location';

export const formatLocation = (
	location?: TLocation,
	short: boolean = false
): string => {
	if (!location) {
		return '';
	}

	const parts: string[] = [];

	if (!short && location.city) {
		parts.push(location.city);
	}

	if (location.state) {
		parts.push(location.state);
	}

	if (location.country) {
		parts.push(location.country);
	}

	return parts.join(', ');
};

export const parseLocation = (location: string): TLocation => {
	const parts = location.split(', ');

	return {
		city: parts[0],
		state: parts[1],
		country: parts[2],
	};
};

export const countryNameToCode = (country: string): string => {
	switch (country) {
		case 'UNITED STATES':
			return 'US';
		case 'CANADA':
			return 'CA';
		case 'JAPAN':
			return 'JP';
		case 'MEXICO':
			return 'MX';
		default:
			return '';
	}
};

export const Countries = {
	AD: { latitude: 42.546245, longitude: 1.601554, name: 'Andorra' },
	AE: {
		latitude: 23.424076,
		longitude: 53.847818,
		name: 'United Arab Emirates',
	},
	AF: { latitude: 33.93911, longitude: 67.709953, name: 'Afghanistan' },
	AG: {
		latitude: 17.060816,
		longitude: -61.796428,
		name: 'Antigua and Barbuda',
	},
	AI: { latitude: 18.220554, longitude: -63.068615, name: 'Anguilla' },
	AL: { latitude: 41.153332, longitude: 20.168331, name: 'Albania' },
	AM: { latitude: 40.069099, longitude: 45.038189, name: 'Armenia' },
	AN: {
		latitude: 12.226079,
		longitude: -69.060087,
		name: 'Netherlands Antilles',
	},
	AO: { latitude: -11.202692, longitude: 17.873887, name: 'Angola' },
	AQ: { latitude: -75.250973, longitude: -0.071389, name: 'Antarctica' },
	AR: { latitude: -38.416097, longitude: -63.616672, name: 'Argentina' },
	AS: {
		latitude: -14.270972,
		longitude: -170.132217,
		name: 'American Samoa',
	},
	AT: { latitude: 47.516231, longitude: 14.550072, name: 'Austria' },
	AU: { latitude: -25.274398, longitude: 133.775136, name: 'Australia' },
	AW: { latitude: 12.52111, longitude: -69.968338, name: 'Aruba' },
	AZ: { latitude: 40.143105, longitude: 47.576927, name: 'Azerbaijan' },
	BA: {
		latitude: 43.915886,
		longitude: 17.679076,
		name: 'Bosnia and Herzegovina',
	},
	BB: { latitude: 13.193887, longitude: -59.543198, name: 'Barbados' },
	BD: { latitude: 23.684994, longitude: 90.356331, name: 'Bangladesh' },
	BE: { latitude: 50.503887, longitude: 4.469936, name: 'Belgium' },
	BF: { latitude: 12.238333, longitude: -1.561593, name: 'Burkina Faso' },
	BG: { latitude: 42.733883, longitude: 25.48583, name: 'Bulgaria' },
	BH: { latitude: 25.930414, longitude: 50.637772, name: 'Bahrain' },
	BI: { latitude: -3.373056, longitude: 29.918886, name: 'Burundi' },
	BJ: { latitude: 9.30769, longitude: 2.315834, name: 'Benin' },
	BM: { latitude: 32.321384, longitude: -64.75737, name: 'Bermuda' },
	BN: { latitude: 4.535277, longitude: 114.727669, name: 'Brunei' },
	BO: { latitude: -16.290154, longitude: -63.588653, name: 'Bolivia' },
	BR: { latitude: -14.235004, longitude: -51.92528, name: 'Brazil' },
	BS: { latitude: 25.03428, longitude: -77.39628, name: 'Bahamas' },
	BT: { latitude: 27.514162, longitude: 90.433601, name: 'Bhutan' },
	BV: { latitude: -54.423199, longitude: 3.413194, name: 'Bouvet Island' },
	BW: { latitude: -22.328474, longitude: 24.684866, name: 'Botswana' },
	BY: { latitude: 53.709807, longitude: 27.953389, name: 'Belarus' },
	BZ: { latitude: 17.189877, longitude: -88.49765, name: 'Belize' },
	CA: { latitude: 56.130366, longitude: -106.346771, name: 'Canada' },
	CC: {
		latitude: -12.164165,
		longitude: 96.870956,
		name: 'Cocos [Keeling] Islands',
	},
	CD: { latitude: -4.038333, longitude: 21.758664, name: 'Congo [DRC]' },
	CF: {
		latitude: 6.611111,
		longitude: 20.939444,
		name: 'Central African Republic',
	},
	CG: {
		latitude: -0.228021,
		longitude: 15.827659,
		name: 'Congo [Republic]',
	},
	CH: { latitude: 46.818188, longitude: 8.227512, name: 'Switzerland' },
	CI: { latitude: 7.539989, longitude: -5.54708, name: "Côte d'Ivoire" },
	CK: { latitude: -21.236736, longitude: -159.777671, name: 'Cook Islands' },
	CL: { latitude: -35.675147, longitude: -71.542969, name: 'Chile' },
	CM: { latitude: 7.369722, longitude: 12.354722, name: 'Cameroon' },
	CN: { latitude: 35.86166, longitude: 104.195397, name: 'China' },
	CO: { latitude: 4.570868, longitude: -74.297333, name: 'Colombia' },
	CR: { latitude: 9.748917, longitude: -83.753428, name: 'Costa Rica' },
	CU: { latitude: 21.521757, longitude: -77.781167, name: 'Cuba' },
	CV: { latitude: 16.002082, longitude: -24.013197, name: 'Cape Verde' },
	CX: {
		latitude: -10.447525,
		longitude: 105.690449,
		name: 'Christmas Island',
	},
	CY: { latitude: 35.126413, longitude: 33.429859, name: 'Cyprus' },
	CZ: { latitude: 49.817492, longitude: 15.472962, name: 'Czech Republic' },
	DE: { latitude: 51.165691, longitude: 10.451526, name: 'Germany' },
	DJ: { latitude: 11.825138, longitude: 42.590275, name: 'Djibouti' },
	DK: { latitude: 56.26392, longitude: 9.501785, name: 'Denmark' },
	DM: { latitude: 15.414999, longitude: -61.370976, name: 'Dominica' },
	DO: {
		latitude: 18.735693,
		longitude: -70.162651,
		name: 'Dominican Republic',
	},
	DZ: { latitude: 28.033886, longitude: 1.659626, name: 'Algeria' },
	EC: { latitude: -1.831239, longitude: -78.183406, name: 'Ecuador' },
	EE: { latitude: 58.595272, longitude: 25.013607, name: 'Estonia' },
	EG: { latitude: 26.820553, longitude: 30.802498, name: 'Egypt' },
	EH: { latitude: 24.215527, longitude: -12.885834, name: 'Western Sahara' },
	ER: { latitude: 15.179384, longitude: 39.782334, name: 'Eritrea' },
	ES: { latitude: 40.463667, longitude: -3.74922, name: 'Spain' },
	ET: { latitude: 9.145, longitude: 40.489673, name: 'Ethiopia' },
	FI: { latitude: 61.92411, longitude: 25.748151, name: 'Finland' },
	FJ: { latitude: -16.578193, longitude: 179.414413, name: 'Fiji' },
	FK: {
		latitude: -51.796253,
		longitude: -59.523613,
		name: 'Falkland Islands [Islas Malvinas]',
	},
	FM: { latitude: 7.425554, longitude: 150.550812, name: 'Micronesia' },
	FO: { latitude: 61.892635, longitude: -6.911806, name: 'Faroe Islands' },
	FR: { latitude: 46.227638, longitude: 2.213749, name: 'France' },
	GA: { latitude: -0.803689, longitude: 11.609444, name: 'Gabon' },
	GB: { latitude: 55.378051, longitude: -3.435973, name: 'United Kingdom' },
	GD: { latitude: 12.262776, longitude: -61.604171, name: 'Grenada' },
	GE: { latitude: 42.315407, longitude: 43.356892, name: 'Georgia' },
	GF: { latitude: 3.933889, longitude: -53.125782, name: 'French Guiana' },
	GG: { latitude: 49.465691, longitude: -2.585278, name: 'Guernsey' },
	GH: { latitude: 7.946527, longitude: -1.023194, name: 'Ghana' },
	GI: { latitude: 36.137741, longitude: -5.345374, name: 'Gibraltar' },
	GL: { latitude: 71.706936, longitude: -42.604303, name: 'Greenland' },
	GM: { latitude: 13.443182, longitude: -15.310139, name: 'Gambia' },
	GN: { latitude: 9.945587, longitude: -9.696645, name: 'Guinea' },
	GP: { latitude: 16.995971, longitude: -62.067641, name: 'Guadeloupe' },
	GQ: {
		latitude: 1.650801,
		longitude: 10.267895,
		name: 'Equatorial Guinea',
	},
	GR: { latitude: 39.074208, longitude: 21.824312, name: 'Greece' },
	GS: {
		latitude: -54.429579,
		longitude: -36.587909,
		name: 'South Georgia and the South Sandwich Islands',
	},
	GT: { latitude: 15.783471, longitude: -90.230759, name: 'Guatemala' },
	GU: { latitude: 13.444304, longitude: 144.793731, name: 'Guam' },
	GW: { latitude: 11.803749, longitude: -15.180413, name: 'Guinea-Bissau' },
	GY: { latitude: 4.860416, longitude: -58.93018, name: 'Guyana' },
	GZ: { latitude: 31.354676, longitude: 34.308825, name: 'Gaza Strip' },
	HK: { latitude: 22.396428, longitude: 114.109497, name: 'Hong Kong' },
	HM: {
		latitude: -53.08181,
		longitude: 73.504158,
		name: 'Heard Island and McDonald Islands',
	},
	HN: { latitude: 15.199999, longitude: -86.241905, name: 'Honduras' },
	HR: { latitude: 45.1, longitude: 15.2, name: 'Croatia' },
	HT: { latitude: 18.971187, longitude: -72.285215, name: 'Haiti' },
	HU: { latitude: 47.162494, longitude: 19.503304, name: 'Hungary' },
	ID: { latitude: -0.789275, longitude: 113.921327, name: 'Indonesia' },
	IE: { latitude: 53.41291, longitude: -8.24389, name: 'Ireland' },
	IL: { latitude: 31.046051, longitude: 34.851612, name: 'Israel' },
	IM: { latitude: 54.236107, longitude: -4.548056, name: 'Isle of Man' },
	IN: { latitude: 20.593684, longitude: 78.96288, name: 'India' },
	IO: {
		latitude: -6.343194,
		longitude: 71.876519,
		name: 'British Indian Ocean Territory',
	},
	IQ: { latitude: 33.223191, longitude: 43.679291, name: 'Iraq' },
	IR: { latitude: 32.427908, longitude: 53.688046, name: 'Iran' },
	IS: { latitude: 64.963051, longitude: -19.020835, name: 'Iceland' },
	IT: { latitude: 41.87194, longitude: 12.56738, name: 'Italy' },
	JE: { latitude: 49.214439, longitude: -2.13125, name: 'Jersey' },
	JM: { latitude: 18.109581, longitude: -77.297508, name: 'Jamaica' },
	JO: { latitude: 30.585164, longitude: 36.238414, name: 'Jordan' },
	JP: { latitude: 36.204824, longitude: 138.252924, name: 'Japan' },
	KE: { latitude: -0.023559, longitude: 37.906193, name: 'Kenya' },
	KG: { latitude: 41.20438, longitude: 74.766098, name: 'Kyrgyzstan' },
	KH: { latitude: 12.565679, longitude: 104.990963, name: 'Cambodia' },
	KI: { latitude: -3.370417, longitude: -168.734039, name: 'Kiribati' },
	KM: { latitude: -11.875001, longitude: 43.872219, name: 'Comoros' },
	KN: {
		latitude: 17.357822,
		longitude: -62.782998,
		name: 'Saint Kitts and Nevis',
	},
	KP: { latitude: 40.339852, longitude: 127.510093, name: 'North Korea' },
	KR: { latitude: 35.907757, longitude: 127.766922, name: 'South Korea' },
	KW: { latitude: 29.31166, longitude: 47.481766, name: 'Kuwait' },
	KY: { latitude: 19.513469, longitude: -80.566956, name: 'Cayman Islands' },
	KZ: { latitude: 48.019573, longitude: 66.923684, name: 'Kazakhstan' },
	LA: { latitude: 19.85627, longitude: 102.495496, name: 'Laos' },
	LB: { latitude: 33.854721, longitude: 35.862285, name: 'Lebanon' },
	LC: { latitude: 13.909444, longitude: -60.978893, name: 'Saint Lucia' },
	LI: { latitude: 47.166, longitude: 9.555373, name: 'Liechtenstein' },
	LK: { latitude: 7.873054, longitude: 80.771797, name: 'Sri Lanka' },
	LR: { latitude: 6.428055, longitude: -9.429499, name: 'Liberia' },
	LS: { latitude: -29.609988, longitude: 28.233608, name: 'Lesotho' },
	LT: { latitude: 55.169438, longitude: 23.881275, name: 'Lithuania' },
	LU: { latitude: 49.815273, longitude: 6.129583, name: 'Luxembourg' },
	LV: { latitude: 56.879635, longitude: 24.603189, name: 'Latvia' },
	LY: { latitude: 26.3351, longitude: 17.228331, name: 'Libya' },
	MA: { latitude: 31.791702, longitude: -7.09262, name: 'Morocco' },
	MC: { latitude: 43.750298, longitude: 7.412841, name: 'Monaco' },
	MD: { latitude: 47.411631, longitude: 28.369885, name: 'Moldova' },
	ME: { latitude: 42.708678, longitude: 19.37439, name: 'Montenegro' },
	MG: { latitude: -18.766947, longitude: 46.869107, name: 'Madagascar' },
	MH: {
		latitude: 7.131474,
		longitude: 171.184478,
		name: 'Marshall Islands',
	},
	MK: {
		latitude: 41.608635,
		longitude: 21.745275,
		name: 'Macedonia [FYROM]',
	},
	ML: { latitude: 17.570692, longitude: -3.996166, name: 'Mali' },
	MM: { latitude: 21.913965, longitude: 95.956223, name: 'Myanmar [Burma]' },
	MN: { latitude: 46.862496, longitude: 103.846656, name: 'Mongolia' },
	MO: { latitude: 22.198745, longitude: 113.543873, name: 'Macau' },
	MP: {
		latitude: 17.33083,
		longitude: 145.38469,
		name: 'Northern Mariana Islands',
	},
	MQ: { latitude: 14.641528, longitude: -61.024174, name: 'Martinique' },
	MR: { latitude: 21.00789, longitude: -10.940835, name: 'Mauritania' },
	MS: { latitude: 16.742498, longitude: -62.187366, name: 'Montserrat' },
	MT: { latitude: 35.937496, longitude: 14.375416, name: 'Malta' },
	MU: { latitude: -20.348404, longitude: 57.552152, name: 'Mauritius' },
	MV: { latitude: 3.202778, longitude: 73.22068, name: 'Maldives' },
	MW: { latitude: -13.254308, longitude: 34.301525, name: 'Malawi' },
	MX: { latitude: 23.634501, longitude: -102.552784, name: 'Mexico' },
	MY: { latitude: 4.210484, longitude: 101.975766, name: 'Malaysia' },
	MZ: { latitude: -18.665695, longitude: 35.529562, name: 'Mozambique' },
	NA: { latitude: -22.95764, longitude: 18.49041, name: 'Namibia' },
	NC: { latitude: -20.904305, longitude: 165.618042, name: 'New Caledonia' },
	NE: { latitude: 17.607789, longitude: 8.081666, name: 'Niger' },
	NF: {
		latitude: -29.040835,
		longitude: 167.954712,
		name: 'Norfolk Island',
	},
	NG: { latitude: 9.081999, longitude: 8.675277, name: 'Nigeria' },
	NI: { latitude: 12.865416, longitude: -85.207229, name: 'Nicaragua' },
	NL: { latitude: 52.132633, longitude: 5.291266, name: 'Netherlands' },
	NO: { latitude: 60.472024, longitude: 8.468946, name: 'Norway' },
	NP: { latitude: 28.394857, longitude: 84.124008, name: 'Nepal' },
	NR: { latitude: -0.522778, longitude: 166.931503, name: 'Nauru' },
	NU: { latitude: -19.054445, longitude: -169.867233, name: 'Niue' },
	NZ: { latitude: -40.900557, longitude: 174.885971, name: 'New Zealand' },
	OM: { latitude: 21.512583, longitude: 55.923255, name: 'Oman' },
	PA: { latitude: 8.537981, longitude: -80.782127, name: 'Panama' },
	PE: { latitude: -9.189967, longitude: -75.015152, name: 'Peru' },
	PF: {
		latitude: -17.679742,
		longitude: -149.406843,
		name: 'French Polynesia',
	},
	PG: {
		latitude: -6.314993,
		longitude: 143.95555,
		name: 'Papua New Guinea',
	},
	PH: { latitude: 12.879721, longitude: 121.774017, name: 'Philippines' },
	PK: { latitude: 30.375321, longitude: 69.345116, name: 'Pakistan' },
	PL: { latitude: 51.919438, longitude: 19.145136, name: 'Poland' },
	PM: {
		latitude: 46.941936,
		longitude: -56.27111,
		name: 'Saint Pierre and Miquelon',
	},
	PN: {
		latitude: -24.703615,
		longitude: -127.439308,
		name: 'Pitcairn Islands',
	},
	PR: { latitude: 18.220833, longitude: -66.590149, name: 'Puerto Rico' },
	PS: {
		latitude: 31.952162,
		longitude: 35.233154,
		name: 'Palestinian Territories',
	},
	PT: { latitude: 39.399872, longitude: -8.224454, name: 'Portugal' },
	PW: { latitude: 7.51498, longitude: 134.58252, name: 'Palau' },
	PY: { latitude: -23.442503, longitude: -58.443832, name: 'Paraguay' },
	QA: { latitude: 25.354826, longitude: 51.183884, name: 'Qatar' },
	RE: { latitude: -21.115141, longitude: 55.536384, name: 'Réunion' },
	RO: { latitude: 45.943161, longitude: 24.96676, name: 'Romania' },
	RS: { latitude: 44.016521, longitude: 21.005859, name: 'Serbia' },
	RU: { latitude: 61.52401, longitude: 105.318756, name: 'Russia' },
	RW: { latitude: -1.940278, longitude: 29.873888, name: 'Rwanda' },
	SA: { latitude: 23.885942, longitude: 45.079162, name: 'Saudi Arabia' },
	SB: { latitude: -9.64571, longitude: 160.156194, name: 'Solomon Islands' },
	SC: { latitude: -4.679574, longitude: 55.491977, name: 'Seychelles' },
	SD: { latitude: 12.862807, longitude: 30.217636, name: 'Sudan' },
	SE: { latitude: 60.128161, longitude: 18.643501, name: 'Sweden' },
	SG: { latitude: 1.352083, longitude: 103.819836, name: 'Singapore' },
	SH: { latitude: -24.143474, longitude: -10.030696, name: 'Saint Helena' },
	SI: { latitude: 46.151241, longitude: 14.995463, name: 'Slovenia' },
	SJ: {
		latitude: 77.553604,
		longitude: 23.670272,
		name: 'Svalbard and Jan Mayen',
	},
	SK: { latitude: 48.669026, longitude: 19.699024, name: 'Slovakia' },
	SL: { latitude: 8.460555, longitude: -11.779889, name: 'Sierra Leone' },
	SM: { latitude: 43.94236, longitude: 12.457777, name: 'San Marino' },
	SN: { latitude: 14.497401, longitude: -14.452362, name: 'Senegal' },
	SO: { latitude: 5.152149, longitude: 46.199616, name: 'Somalia' },
	SR: { latitude: 3.919305, longitude: -56.027783, name: 'Suriname' },
	ST: {
		latitude: 0.18636,
		longitude: 6.613081,
		name: 'São Tomé and Príncipe',
	},
	SV: { latitude: 13.794185, longitude: -88.89653, name: 'El Salvador' },
	SY: { latitude: 34.802075, longitude: 38.996815, name: 'Syria' },
	SZ: { latitude: -26.522503, longitude: 31.465866, name: 'Swaziland' },
	TC: {
		latitude: 21.694025,
		longitude: -71.797928,
		name: 'Turks and Caicos Islands',
	},
	TD: { latitude: 15.454166, longitude: 18.732207, name: 'Chad' },
	TF: {
		latitude: -49.280366,
		longitude: 69.348557,
		name: 'French Southern Territories',
	},
	TG: { latitude: 8.619543, longitude: 0.824782, name: 'Togo' },
	TH: { latitude: 15.870032, longitude: 100.992541, name: 'Thailand' },
	TJ: { latitude: 38.861034, longitude: 71.276093, name: 'Tajikistan' },
	TK: { latitude: -8.967363, longitude: -171.855881, name: 'Tokelau' },
	TL: { latitude: -8.874217, longitude: 125.727539, name: 'Timor-Leste' },
	TM: { latitude: 38.969719, longitude: 59.556278, name: 'Turkmenistan' },
	TN: { latitude: 33.886917, longitude: 9.537499, name: 'Tunisia' },
	TO: { latitude: -21.178986, longitude: -175.198242, name: 'Tonga' },
	TR: { latitude: 38.963745, longitude: 35.243322, name: 'Turkey' },
	TT: {
		latitude: 10.691803,
		longitude: -61.222503,
		name: 'Trinidad and Tobago',
	},
	TV: { latitude: -7.109535, longitude: 177.64933, name: 'Tuvalu' },
	TW: { latitude: 23.69781, longitude: 120.960515, name: 'Taiwan' },
	TZ: { latitude: -6.369028, longitude: 34.888822, name: 'Tanzania' },
	UA: { latitude: 48.379433, longitude: 31.16558, name: 'Ukraine' },
	UG: { latitude: 1.373333, longitude: 32.290275, name: 'Uganda' },
	UM: {
		latitude: 19.295278,
		longitude: 166.631111,
		name: 'U.S. Minor Outlying Islands',
	},
	US: { latitude: 37.09024, longitude: -95.712891, name: 'United States' },
	UY: { latitude: -32.522779, longitude: -55.765835, name: 'Uruguay' },
	UZ: { latitude: 41.377491, longitude: 64.585262, name: 'Uzbekistan' },
	VA: { latitude: 41.902916, longitude: 12.453389, name: 'Vatican City' },
	VC: {
		latitude: 12.984305,
		longitude: -61.287228,
		name: 'Saint Vincent and the Grenadines',
	},
	VE: { latitude: 6.42375, longitude: -66.58973, name: 'Venezuela' },
	VG: {
		latitude: 18.420695,
		longitude: -64.639968,
		name: 'British Virgin Islands',
	},
	VI: {
		latitude: 18.335765,
		longitude: -64.896335,
		name: 'U.S. Virgin Islands',
	},
	VN: { latitude: 14.058324, longitude: 108.277199, name: 'Vietnam' },
	VU: { latitude: -15.376706, longitude: 166.959158, name: 'Vanuatu' },
	WF: {
		latitude: -13.768752,
		longitude: -177.156097,
		name: 'Wallis and Futuna',
	},
	WS: { latitude: -13.759029, longitude: -172.104629, name: 'Samoa' },
	XK: { latitude: 42.602636, longitude: 20.902977, name: 'Kosovo' },
	YE: { latitude: 15.552727, longitude: 48.516388, name: 'Yemen' },
	YT: { latitude: -12.8275, longitude: 45.166244, name: 'Mayotte' },
	ZA: { latitude: -30.559482, longitude: 22.937506, name: 'South Africa' },
	ZM: { latitude: -13.133897, longitude: 27.849332, name: 'Zambia' },
	ZW: { latitude: -19.015438, longitude: 29.154857, name: 'Zimbabwe' },
} as const;

export const States = {
	AB: { name: 'Alberta', latitude: 54.5, longitude: -115 },
	AK: { name: 'Alaska', latitude: 63.588753, longitude: -154.493062 },
	AL: { name: 'Alabama', latitude: 32.318231, longitude: -86.902298 },
	AR: { name: 'Arkansas', latitude: 35.20105, longitude: -91.831833 },
	AZ: { name: 'Arizona', latitude: 34.048928, longitude: -111.093731 },
	BC: { name: 'British Columbia', latitude: 54, longitude: -125 },
	CA: { name: 'California', latitude: 36.778261, longitude: -119.417932 },
	CO: { name: 'Colorado', latitude: 39.550051, longitude: -105.782067 },
	CT: { name: 'Connecticut', latitude: 41.603221, longitude: -73.087749 },
	DC: {
		name: 'District of Columbia',
		latitude: 38.905985,
		longitude: -77.033418,
	},
	DE: { name: 'Delaware', latitude: 38.910832, longitude: -75.52767 },
	FL: { name: 'Florida', latitude: 27.664827, longitude: -81.515754 },
	GA: { name: 'Georgia', latitude: 32.157435, longitude: -82.907123 },
	HI: { name: 'Hawaii', latitude: 19.898682, longitude: -155.665857 },
	IA: { name: 'Iowa', latitude: 41.878003, longitude: -93.097702 },
	ID: { name: 'Idaho', latitude: 44.068202, longitude: -114.742041 },
	IL: { name: 'Illinois', latitude: 40.633125, longitude: -89.398528 },
	IN: { name: 'Indiana', latitude: 40.551217, longitude: -85.602364 },
	KS: { name: 'Kansas', latitude: 39.011902, longitude: -98.484246 },
	KY: { name: 'Kentucky', latitude: 37.839333, longitude: -84.270018 },
	LA: { name: 'Louisiana', latitude: 31.244823, longitude: -92.145024 },
	MA: { name: 'Massachusetts', latitude: 42.407211, longitude: -71.382437 },
	MB: { name: 'Manitoba', latitude: 55, longitude: -97 },
	MD: { name: 'Maryland', latitude: 39.045755, longitude: -76.641271 },
	ME: { name: 'Maine', latitude: 45.253783, longitude: -69.445469 },
	MI: { name: 'Michigan', latitude: 44.314844, longitude: -85.602364 },
	MN: { name: 'Minnesota', latitude: 46.729553, longitude: -94.6859 },
	MO: { name: 'Missouri', latitude: 37.964253, longitude: -91.831833 },
	MS: { name: 'Mississippi', latitude: 32.354668, longitude: -89.398528 },
	MT: { name: 'Montana', latitude: 46.879682, longitude: -110.362566 },
	NB: { name: 'New Brunswick', latitude: 46.5, longitude: -66 },
	NC: { name: 'North Carolina', latitude: 35.759573, longitude: -79.0193 },
	ND: { name: 'North Dakota', latitude: 47.551493, longitude: -101.002012 },
	NE: { name: 'Nebraska', latitude: 41.492537, longitude: -99.901813 },
	NH: { name: 'New Hampshire', latitude: 43.193852, longitude: -71.572395 },
	NJ: { name: 'New Jersey', latitude: 40.058324, longitude: -74.405661 },
	NL: {
		name: 'Newfoundland and Labrador',
		latitude: 53.23,
		longitude: -59.999167,
	},
	NM: { name: 'New Mexico', latitude: 34.97273, longitude: -105.032363 },
	NS: { name: 'Nova Scotia', latitude: 45, longitude: -63 },
	NT: { name: 'Northwest Territories', latitude: 67, longitude: -121 },
	NU: { name: 'Nunavut', latitude: 70.166667, longitude: -90.733333 },
	NV: { name: 'Nevada', latitude: 38.80261, longitude: -116.419389 },
	NY: { name: 'New York', latitude: 43.299428, longitude: -74.217933 },
	OH: { name: 'Ohio', latitude: 40.417287, longitude: -82.907123 },
	OK: { name: 'Oklahoma', latitude: 35.007752, longitude: -97.092877 },
	ON: { name: 'Ontario', latitude: 49.25, longitude: -84.5 },
	OR: { name: 'Oregon', latitude: 43.804133, longitude: -120.554201 },
	PA: { name: 'Pennsylvania', latitude: 41.203322, longitude: -77.194525 },
	PE: { name: 'Prince Edward Island', latitude: 46.4, longitude: -63.2 },
	PR: { name: 'Puerto Rico', latitude: 18.220833, longitude: -66.590149 },
	QC: { name: 'Quebec', latitude: 52, longitude: -72 },
	RI: { name: 'Rhode Island', latitude: 41.580095, longitude: -71.477429 },
	SC: { name: 'South Carolina', latitude: 33.836081, longitude: -81.163725 },
	SD: { name: 'South Dakota', latitude: 43.969515, longitude: -99.901813 },
	SK: { name: 'Saskatchewan', latitude: 54, longitude: -106.000556 },
	TN: { name: 'Tennessee', latitude: 35.517491, longitude: -86.580447 },
	TX: { name: 'Texas', latitude: 31.968599, longitude: -99.901813 },
	UT: { name: 'Utah', latitude: 39.32098, longitude: -111.093731 },
	VA: { name: 'Virginia', latitude: 37.431573, longitude: -78.656894 },
	VT: { name: 'Vermont', latitude: 44.558803, longitude: -72.577841 },
	WA: { name: 'Washington', latitude: 47.751074, longitude: -120.740139 },
	WI: { name: 'Wisconsin', latitude: 43.78444, longitude: -88.787868 },
	WV: { name: 'West Virginia', latitude: 38.597626, longitude: -80.454903 },
	WY: { name: 'Wyoming', latitude: 43.075968, longitude: -107.290284 },
	YT: { name: 'Yukon', latitude: 63, longitude: -135 },
} as const;

export const country = (country: string) =>
	Countries[country as keyof typeof Countries] || null;

export const state = (state: string) =>
	States[state as keyof typeof States] || null;
