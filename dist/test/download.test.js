import { createClient } from './common.js';
export async function runDownloadTest() {
    const client = await createClient();
    try {
        await client.downloadFile('remote.txt', './downloaded.txt');
        console.log('Download Test - File downloaded successfully');
    }
    catch (err) {
        console.error('Download Test Error:', err);
        throw err;
    }
    finally {
        await client.disconnect();
        console.log('Download Test - Connection closed');
    }
}
