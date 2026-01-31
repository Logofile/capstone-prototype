import 'dotenv/config';
import PocketBase from 'pocketbase';

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

    // Helper to create or get collection
    const ensureCollection = async (data) => {
        try {
            const result = await pb.collections.create(data);
            console.log(`Created collection: ${data.name} (${result.id})`);
            return result;
        } catch (e) {
            // Check if validation error due to already existing
            const isDuplicate = e.status === 400 && (
                e.response?.data?.name?.code === 'validation_not_unique' ||
                e.response?.data?.name?.code === 'validation_collection_name_exists'
            );

            if (isDuplicate) {
                console.log(`Collection ${data.name} already exists. Updating rules...`);
                try {
                    const existing = await pb.collections.getOne(data.name);
                    const result = await pb.collections.update(existing.id, data);
                    console.log(`Updated collection rules: ${data.name}`);
                    return result;
                } catch (fetchErr) {
                    console.error(`Failed to update existing collection ${data.name}:`, fetchErr.message);
                    return null;
                }
            } else {
                console.error(`Error creating ${data.name}:`, JSON.stringify(e.response || e.message, null, 2));
                return null;
            }
        }
    };

    // 1. ORGANIZATIONS
    const orgCollection = await ensureCollection({
        name: 'organizations',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.id != ""',
        schema: [
            { name: 'name', type: 'text', required: true },
            { name: 'description', type: 'editor' },
            { name: 'website', type: 'url' },
            { name: 'is_verified', type: 'bool' }
        ]
    });

    if (!orgCollection) {
        console.error('Failed to initialize organizations. Aborting.');
        process.exit(1);
    }

    // 2. USERS EXTENSION
    // Note: We cannot easily modify system collections via SDK gracefully without proper migration logic usually,
    // but we will try to fetch and ignore if we can't.
    // In this script we won't strictly depend on user extension IDs for the next steps, 
    // but properly linking requires users to be setup.
    // For now, we skip automating user schema modification to avoid complexity, assuming manual or later fix.

    // 3. OPPORTUNITIES
    const oppCollection = await ensureCollection({
        name: 'opportunities',
        type: 'base',
        listRule: '', // Public
        viewRule: '', // Public
        createRule: '@request.auth.id != ""', // Authenticated
        updateRule: '@request.auth.id != ""',
        deleteRule: '@request.auth.id != ""',
        schema: [
            { name: 'title', type: 'text', required: true },
            { name: 'organization', type: 'relation', required: true, options: { maxSelect: 1, collectionId: orgCollection.id } },
            { name: 'description', type: 'editor' },
            { name: 'tags', type: 'json', options: { maxSize: 2000000 } },
            { name: 'form_schema', type: 'json', options: { maxSize: 2000000 } },
            { name: 'is_published', type: 'bool' },
            { name: 'point_of_contact', type: 'json', options: { maxSize: 2000000 } }
        ]
    });

    if (!oppCollection) process.exit(1);

    // 4. SHIFTS
    const shiftCollection = await ensureCollection({
        name: 'shifts',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != ""',
        deleteRule: '@request.auth.id != ""',
        schema: [
            { name: 'opportunity', type: 'relation', required: true, options: { maxSelect: 1, collectionId: oppCollection.id, cascadeDelete: true } },
            { name: 'start', type: 'date', required: true },
            { name: 'end', type: 'date', required: true },
            { name: 'capacity', type: 'number', required: true },
            { name: 'filled', type: 'number' }
        ]
    });

    if (!shiftCollection) process.exit(1);

    // 5. SIGNUPS
    // We need users collection ID for the relation
    let usersId = 'users'; // default system id usually, but let's fetch to be safe
    try {
        const u = await pb.collections.getOne('users');
        usersId = u.id;
    } catch (e) {
        console.log('Could not fetch users collection ID, using default "users"');
    }

    await ensureCollection({
        name: 'signups',
        type: 'base',
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != ""',
        schema: [
            { name: 'shift', type: 'relation', required: true, options: { maxSelect: 1, collectionId: shiftCollection.id } },
            { name: 'user', type: 'relation', required: true, options: { maxSelect: 1, collectionId: usersId } },
            { name: 'status', type: 'select', options: { maxSelect: 1, values: ['pending', 'confirmed', 'cancelled', 'noshow'] } },
            { name: 'form_data', type: 'json', options: { maxSize: 2000000 } },
            { name: 'reminder_sent', type: 'date' }
        ]
    });

    console.log('Schema setup complete!');
}

main();
