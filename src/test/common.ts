import dotenv from 'dotenv';
dotenv.config();

import { SecureFileTransferClient, Protocol } from '../index.js';

export const protocol: Protocol = (process.env.PROTOCOL as Protocol) || 'ftp';

export const connectionOptions = {
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

/**
 * Creates a SecureFileTransferClient, connecting to the server using the
 * connection options specified in this module.
 *
 * @returns A promise that resolves with a SecureFileTransferClient that is
 *          connected to the server.
 */
export async function createClient() {
    const client = new SecureFileTransferClient(
        protocol,
        process.env.ROOT_PATH as string
    );
    await client.connect(connectionOptions);
    console.log(`Connected using ${protocol.toUpperCase()}`);
    return client;
}
