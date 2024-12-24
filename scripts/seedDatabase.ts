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

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Initialize Firebase Admin first
initializeApp({
	credential: cert({
		projectId: process.env.FIREBASE_PROJECT_ID,
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
	}),
});

// Get database reference after initialization
const db = getFirestore();

// Generate a GUIDs
const guidEdition = uuidv4();
const guidCar = uuidv4();
const guidOwner = uuidv4();

// Sample data
const editions = [
	{
		name: 'British Racing Green',
		color: 'British Racing Green',
		generation: 'NA',
		year: 1991,
		totalProduced: 4000,
		image: `${guidEdition}.jpg`,
		description: [
			"The 1991 Special Edition represents Mazda's first special production Miata for the North American market. Limited to just 4,000 units, this edition featured a distinctive British Racing Green exterior paired with a tan leather interior, making it instantly recognizable among early NA Miatas.",
			'Each car came equipped with a unique numbered dash badge, tan vinyl top, headrest speakers, stainless steel door sills, and color-matched Nardi wooden steering wheel, shift knob, and handbrake handle. The edition also featured power windows, power steering, and a limited-slip differential as standard equipment.',
			"The combination of British Racing Green paint and tan interior was a deliberate homage to classic British sports cars, particularly those from the 1960s. This edition marked the beginning of Mazda's tradition of producing limited-run Miatas, setting a precedent for future special editions.",
		],
		imageCarId: db.doc(`cars/${guidCar}`),
	},
];

const cars = [
	{
		color: 'British Racing Green',
		vin: 'JM1NA3510M1221538',
		ownerId: db.doc(`owners/${guidOwner}`),
		image: '/images/cars/1991SE182.jpg',
		sequence: 182,
		editionId: db.doc(`editions/${guidEdition}`),
		manufactureDate: '1990-12-06T20:40:00',
		shipping: {
			port: 'BENECIA',
			vessel: 'ASIAN HIGHWAY',
			date: '1990-12-14',
		},
		location: {
			country: 'US',
			state: 'TX',
			city: 'Austin',
		},
		sale: {
			date: '1991-02-05',
			msrp: 21423,
			dealer: {
				name: 'Marin Mazda',
				location: {
					country: 'US',
					state: 'CA',
					city: 'San Rafael',
				},
			},
		},
	},
];

async function seedDatabase() {
	try {
		// Seed editions
		const editionsBatch = db.batch();

		editions.forEach((edition) => {
			const ref = db.collection('editions').doc(guidEdition);
			editionsBatch.set(ref, edition);
		});

		await editionsBatch.commit();

		console.log('Editions seeded successfully');

		// Seed cars
		const carsBatch = db.batch();

		cars.forEach((car) => {
			const ref = db.collection('cars').doc(guidCar);
			carsBatch.set(ref, car);
		});

		await carsBatch.commit();

		console.log('Cars seeded successfully');
	} catch (error) {
		console.error('Error seeding database:', error);
	}

	process.exit();
}

seedDatabase();
