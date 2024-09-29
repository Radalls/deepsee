import { readdirSync, readFileSync } from 'fs';
import path, { join } from 'path';

import { Client } from 'pg';

export let client = new Client();

const localConfig = false;
const prodConfig = { rejectUnauthorized: false };

export const connectToDatabase = async (): Promise<void> => {
    console.warn('Connecting to database...');
    console.warn(`Database: ${process.env.ENV} ${process.env.DB_NAME}`);
    client = new Client({
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
        ssl: process.env.ENV === 'local' ? localConfig : prodConfig,
        user: process.env.DB_USER,
    });

    try {
        await client.connect();
        console.warn('Database connected 👍');
    } catch (err) {
        throw new Error(`Failed to connect to database: ${err}`);
    }

    runMigrations(client);
};

const runMigrations = async (client: Client) => {
    const migrationDir = path.join(process.cwd(), 'migrations');
    const files = await readdirSync(migrationDir);

    for (let i = 0; i < files.length; i++) {

        const success = await applyMigration(client, files[i], migrationDir);
        if (!success) {
            throw new Error(`Migration failed: ${files[i]}`);
        }
    }

    console.warn('Migrations completed 👍');
};

const applyMigration = async (client: Client, file: string, migrationDir: string): Promise<boolean> => {
    const migrationScript = readFileSync(join(migrationDir, file), 'utf8');

    try {
        const checkTableExistsQuery = `
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'history'
            );
        `;

        const tableExistsResult = await client.query(checkTableExistsQuery);
        if (tableExistsResult.rows[0].exists === true) {
            const checkQuery = 'SELECT COUNT(*) FROM history WHERE file_name = $1;';
            const result = await client.query(checkQuery, [file]);

            if (result.rows[0].count > 0) {
                return true;
            }
        }

        await client.query(migrationScript);

        const timestamp = new Date().toISOString();
        const insertQuery = 'INSERT INTO history (file_name, timestamp) VALUES ($1, $2);';

        await client.query(insertQuery, [file, timestamp]);

        console.warn(`Migration applied: ${file}`);

        return true;
    } catch (err: any) {
        await client.query('ROLLBACK');
    }

    return false;
};
