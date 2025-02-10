// test/upload.test.ts
import { createClient } from './common.js';

export async function runUploadTest() {
    const client = await createClient();
    try {
        await client.uploadFile('./local.txt', 'remote.txt');
        console.log('Upload Test - File uploaded successfully');
    } catch (err) {
        console.error('Upload Test Error:', err);
        throw err;
    } finally {
        await client.disconnect();
        console.log('Upload Test - Connection closed');
    }
}
