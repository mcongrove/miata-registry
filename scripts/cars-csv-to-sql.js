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
			`INSERT INTO cars (id,vin,color,edition_id,sequence,destroyed,manufacture_date,shipping_date,shipping_city,shipping_state,shipping_country,shipping_vessel,sale_date,sale_dealer_name,sale_dealer_city,sale_dealer_state,sale_dealer_country,sale_msrp,current_owner_id) VALUES ('${uuidv4()}',${record.vin ? `'${record.vin}'` : 'NULL'},${record.color ? `'${record.color}'` : 'NULL'},${record.edition_id ? `'${record.edition_id}'` : 'NULL'},${record.sequence ? record.sequence : 'NULL'},${record.destroyed ? (record.destroyed.toLowerCase() === 'true' ? 1 : 0) : 0},${formatDate(record.manufacture_date)},${formatDate(record.shipping_date)},${record.shipping_city ? `'${record.shipping_city}'` : 'NULL'},${record.shipping_state ? `'${record.shipping_state}'` : 'NULL'},${record.shipping_country ? `'${record.shipping_country}'` : 'NULL'},${record.shipping_vessel ? `'${record.shipping_vessel}'` : 'NULL'},${formatDate(record.sale_date)},${record.sale_dealer_name ? `'${record.sale_dealer_name}'` : 'NULL'},${record.sale_dealer_city ? `'${record.sale_dealer_city}'` : 'NULL'},${record.sale_dealer_state ? `'${record.sale_dealer_state}'` : 'NULL'},${record.sale_dealer_country ? `'${record.sale_dealer_country}'` : 'NULL'},${record.sale_msrp ? record.sale_msrp : 'NULL'},${record.current_owner_id ? `'${record.current_owner_id}'` : 'NULL'});`
	)
	.join('\n');

// Write to a file
writeFileSync(sqlPath, sql);
console.log(`Created ${sqlPath} with ${records.length} INSERT statements`);
