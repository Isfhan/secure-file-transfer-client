import { createClient } from './common.js';
export async function runDeleteTest() {
    const client = await createClient();
    try {
        await client.deleteFile('remote-renamed.txt');
        console.log('Delete Test - File deleted successfully');
    }
    catch (err) {
        console.error('Delete Test Error:', err);
        throw err;
    }
    finally {
        await client.disconnect();
        console.log('Delete Test - Connection closed');
    }
}
