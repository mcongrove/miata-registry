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

			return `INSERT INTO owners (id,name,country,state,city) VALUES ('${uuidv4()}',${record.name ? `'${record.name.replace(/'/g, "''")}'` : 'NULL'},${record.country ? `'${record.country}'` : 'NULL'},${record.state ? `'${record.state}'` : 'NULL'},${record.city ? `'${record.city}'` : 'NULL'});`;
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
