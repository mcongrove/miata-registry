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

// node csv-to-sql.js "data-1991SE.csv"

import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Get CSV filename from command line args
const csvPath = process.argv[2];
if (!csvPath) {
	console.error('Please provide a CSV file path');
	process.exit(1);
}

// Generate SQL filename from CSV filename
const sqlPath = csvPath.replace('.csv', '.sql');

// Read the CSV file
const csvData = readFileSync(csvPath);
const records = parse(csvData, {
	columns: true,
	skip_empty_lines: true,
});

// Function to format date for SQLite
const formatDate = (dateStr) => {
	if (!dateStr) return 'NULL';
	const date = new Date(dateStr);
	return `'${date.toISOString()}'`;
};

// Create individual INSERT statements for each record
const sql = records
	.map(
		(record, index) =>
			`INSERT INTO cars (
	id,
	vin,
	color,
	edition_id,
	sequence,
	destroyed,
	manufacture_date,
	manufacture_city,
	manufacture_country,
	shipping_date,
	shipping_city,
	shipping_state,
	shipping_country,
	shipping_vessel,
	sale_date,
	sale_dealer_name,
	sale_dealer_location_city,
	sale_dealer_location_state,
	sale_dealer_location_country,
	sale_msrp

) VALUES (
	'${uuidv4()}',
	'${record.vin}',
	'${record['edition.color']}',
	'${record['editionId.__ref__']}',
	${record.sequence},
	${record.destroyed.toLowerCase() === 'true' ? 1 : 0},
	${formatDate(record['manufacture.date'])},
	'${record['manufacture.location.city']}',
	'${record['manufacture.location.country']}',
	${formatDate(record['shipping.date'])},
	${record['shipping.location.city'] ? `'${record['shipping.location.city']}'` : 'NULL'},
	${record['shipping.location.state'] ? `'${record['shipping.location.state']}'` : 'NULL'},
	${record['shipping.location.country'] ? `'${record['shipping.location.country']}'` : 'NULL'},
	${record['shipping.vessel'] ? `'${record['shipping.vessel']}'` : 'NULL'},
	${formatDate(record['sale.date'])},
	${record['sale.dealer.name'] ? `'${record['sale.dealer.name']}'` : 'NULL'},
	${record['sale.dealer.location.city'] ? `'${record['sale.dealer.location.city']}'` : 'NULL'},
	${record['sale.dealer.location.state'] ? `'${record['sale.dealer.location.state']}'` : 'NULL'},
	${record['sale.dealer.location.country'] ? `'${record['sale.dealer.location.country']}'` : 'NULL'},
	${record['sale.msrp'] ? record['sale.msrp'] : 'NULL'}
);`
	)
	.join('\n\n');

// Write to a file
writeFileSync(sqlPath, sql);
console.log(`Created ${sqlPath} with ${records.length} INSERT statements`);
