import { SecureFileTransferClient, Protocol } from '../index.js';
export declare const protocol: Protocol;
export declare const connectionOptions: {
    host: string | undefined;
    user: string | undefined;
    password: string | undefined;
    port: number;
    secure: boolean | undefined;
    secureOptions: {
        rejectUnauthorized: boolean;
    } | undefined;
};
/**
 * Creates a SecureFileTransferClient, connecting to the server using the
 * connection options specified in this module.
 *
 * @returns A promise that resolves with a SecureFileTransferClient that is
 *          connected to the server.
 */
export declare function createClient(): Promise<SecureFileTransferClient>;
