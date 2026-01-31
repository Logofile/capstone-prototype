import 'dotenv/config';

if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASS) {
    console.log('Environment variables loaded successfully.');
    console.log('Email:', process.env.ADMIN_EMAIL);
} else {
    console.error('Failed to load environment variables.');
    process.exit(1);
}
