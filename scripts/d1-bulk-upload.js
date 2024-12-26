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
