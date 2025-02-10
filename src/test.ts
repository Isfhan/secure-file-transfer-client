// Imports dotenv
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import { SecureFileTransferClient, Protocol } from './index.js';

// Determine protocol: "ftp", "ftps", or "sftp" (for example via environment variable)
const protocol: Protocol = (process.env.PROTOCOL as Protocol) || 'ftp';

// Set connection options accordingly. For FTPS, pass secure options; for SFTP, include options like privateKey if needed.
const connectionOptions = {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    port: protocol === 'sftp' ? 22 : 21,
    secure: protocol === 'ftps' ? true : undefined,
    secureOptions:
        protocol === 'ftps'
            ? { rejectUnauthorized: process.env.NODE_ENV !== 'development' }
            : undefined,
};

(async () => {
    console.log(connectionOptions);

    const client = new SecureFileTransferClient(protocol);

    try {
        await client.connect(connectionOptions);
        console.log(`Connected using ${protocol.toUpperCase()}`);

        // List files in the root directory
        const files = await client.list(process.env.ROOT_PATH);
        console.log('Files:', files);

        // Upload, download, rename, delete operations can be performed as needed
        // await client.uploadFile(
        //     './local.txt',
        //     process.env.ROOT_PATH + 'remote.txt'
        // );
        // await client.downloadFile(
        //     process.env.ROOT_PATH + 'remote.txt',
        //     './downloaded.txt'
        // );
        // await client.renameFile(
        //     process.env.ROOT_PATH + 'remote.txt',
        //     process.env.ROOT_PATH + 'remote-renamed.txt'
        // );
        // await client.deleteFile(process.env.ROOT_PATH + '/remote-renamed.txt');
    } catch (err) {
        console.error('Transfer error:', err);
    } finally {
        await client.disconnect();
        console.log('Connection closed');
    }
})();
