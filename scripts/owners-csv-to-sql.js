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

import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync } from 'fs';

// Get CSV filename from command line args
const csvPath = process.argv[2];
if (!csvPath) {
	console.error('Please provide a CSV file path');
	process.exit(1);
}

// Generate SQL filename from CSV filename
const sqlPath = csvPath.replace('.csv', '.sql');

// Read and log the CSV file content
const csvData = readFileSync(csvPath, 'utf-8');
console.log('CSV Data (first 200 chars):', csvData.substring(0, 200));

// Parse CSV with debug logging
try {
	const records = parse(csvData, {
		delimiter: ',',
		columns: true,
		skip_empty_lines: true,
		trim: true,
	});

	console.log('Number of records parsed:', records.length);
	console.log('First record:', records[0]);

	// Create individual INSERT statements for each record
	const sql = records
		.map((record) => {
			console.log('Processing record:', record);

			return `INSERT INTO owners (id,name,country,state,city) VALUES ('${crypto.randomUUID()}',${record.name ? `'${record.name.replace(/'/g, "''")}'` : 'NULL'},${record.country ? `'${record.country}'` : 'NULL'},${record.state ? `'${record.state}'` : 'NULL'},${record.city ? `'${record.city}'` : 'NULL'});`;
		})
		.join('\n');

	// Log SQL output length
	console.log('Generated SQL length:', sql.length);

	// Write to a file
	writeFileSync(sqlPath, sql);
	console.log(`Created ${sqlPath}`);
} catch (error) {
	console.error('Error parsing CSV:', error);
	process.exit(1);
}
