import { createClient } from './common.js';

export async function runPwdTest(): Promise<void> {
    const client = await createClient();
    try {
        const currentDir = await client.pwd();
        console.log('PWD Test - Current directory:', currentDir);
    } catch (err) {
        console.error('PWD Test Error:', err);
        throw err;
    } finally {
        await client.disconnect();
        console.log('PWD Test - Connection closed');
    }
}
