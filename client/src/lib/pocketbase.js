import PocketBase from 'pocketbase';

// Connect to the operational PocketBase instance
// In development, we use localhost:8090 because Vite runs on 5173.
// In production (built), we use relative path '/' because PB serves the static files.
const url = import.meta.env.DEV ? 'http://127.0.0.1:8090' : '/';
const pb = new PocketBase(url);

export default pb;
