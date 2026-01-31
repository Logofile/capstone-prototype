import 'dotenv/config';
import PocketBase from 'pocketbase';

// Connect to the operational PocketBase instance
// Use localhost because we are running this script ON the server (or locally pointing to localhost)
const pb = new PocketBase('http://127.0.0.1:8090');

// CONFIGURATION
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS = process.env.ADMIN_PASS;

if (!ADMIN_EMAIL || !ADMIN_PASS) {
    console.error('Error: ADMIN_EMAIL or ADMIN_PASS environment variables are missing.');
    process.exit(1);
}

async function main() {
    console.log('Connecting to PocketBase...');

    try {
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASS);
        console.log('Authenticated as Admin.');
    } catch (e) {
        console.error('Failed to authenticate.', e.message);
        process.exit(1);
    }

    try {
        const collection = await pb.collections.getOne('users');

        // Check if 'type' field already exists
        const hasType = collection.schema.some(f => f.name === 'type');

        if (hasType) {
            console.log('Collection "users" already has a "type" field. No changes needed.');
            return;
        }

        console.log('Adding "type" field to "users" collection...');

        // Add the type field
        const newField = {
            name: 'type',
            type: 'select',
            required: true,
            options: {
                maxSelect: 1,
                values: ['public', 'provider']
            }
        };

        // Update schema
        const newSchema = [...collection.schema, newField];

        await pb.collections.update(collection.id, {
            schema: newSchema
        });

        console.log('Successfully added "type" field to users collection!');

    } catch (e) {
        console.error('Failed to update users schema:', e.message);
        if (e.response) {
            console.error('Details:', JSON.stringify(e.response, null, 2));
        }
    }
}

main();
