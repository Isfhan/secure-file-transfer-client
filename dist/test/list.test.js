import { createClient } from './common.js';
export async function runListTest() {
    const client = await createClient();
    try {
        const files = await client.list('/');
        console.log('List Test - Files:', files);
    }
    catch (err) {
        console.error('List Test Error:', err);
        throw err;
    }
    finally {
        await client.disconnect();
        console.log('List Test - Connection closed');
    }
}
