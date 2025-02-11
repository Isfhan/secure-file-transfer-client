import { createClient } from './common.js';

export async function runCdTest() {
    const client = await createClient();
    try {
        // Change working directory to '/new/path/'
        await client.cd('carrier/');
        console.log('CD Test - Changed working directory to carrier');

        // List files in the new directory to verify the change
        const files = await client.list();
        console.log('CD Test - Files in new directory:', files);
    } catch (err) {
        console.error('CD Test Error:', err);
        throw err;
    } finally {
        await client.disconnect();
        console.log('CD Test - Connection closed');
    }
}
