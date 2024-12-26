// node scripts/d1-bulk-upload.js data-1991SE.sql

import { exec } from 'child_process';

// Get SQL filename from command line args
const sqlPath = process.argv[2];
if (!sqlPath) {
	console.error('Please provide a SQL file path');
	process.exit(1);
}

// Ensure the file exists
if (!sqlPath.endsWith('.sql')) {
	console.error('File must be a .sql file');
	process.exit(1);
}

console.log(`Uploading ${sqlPath} to D1...`);

// Execute wrangler command
exec(
	`npx wrangler d1 execute registry --remote --file=${sqlPath}`,
	(error, stdout, stderr) => {
		if (error) {
			console.error(`Error: ${error.message}`);
			return;
		}
		if (stderr) {
			console.error(`stderr: ${stderr}`);
			return;
		}
		console.log(`stdout: ${stdout}`);
		console.log('Upload complete!');
	}
);
