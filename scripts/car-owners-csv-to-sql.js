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

// node car-owners-to-sql.js "data-car-owners.csv"

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
		(record) =>
			`INSERT INTO car_owners (car_id,owner_id,date_start,date_end) VALUES ('${record.car_id}','${record.owner_id}',${formatDate(record.date_start)},${formatDate(record.date_end)});`
	)
	.join('\n');

// Write to a file
writeFileSync(sqlPath, sql);
console.log(`Created ${sqlPath} with ${records.length} INSERT statements`);
