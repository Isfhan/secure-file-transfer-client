import { createClient } from './common.js';

export async function runRenameTest() {
    const client = await createClient();
    try {
        await client.renameFile('remote.txt', 'remote-renamed.txt');
        console.log('Rename Test - File renamed successfully');
    } catch (err) {
        console.error('Rename Test Error:', err);
        throw err;
    } finally {
        await client.disconnect();
        console.log('Rename Test - Connection closed');
    }
}
