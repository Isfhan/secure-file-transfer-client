// Import basic-ftp and ssh2-sftp-client
import { FTPClient } from './ftp-client.js';
import { SFTPClient } from './sftp-client.js';

import { IFileTransferClient, Protocol } from './types/index.js';
import type { AccessOptions } from 'basic-ftp';
import type { ConnectOptions } from 'ssh2-sftp-client';

export class SecureFileTransferClient implements IFileTransferClient {
    // Private property
    private client: IFileTransferClient;
    private rootPath: string;

    /**
     * Constructs a new instance of the SecureFileTransferClient class.
     *
     * @param protocol The protocol to use for file transfer. Supported values are 'ftp', 'ftps', and 'sftp'.
     *                 Defaults to 'ftp'.
     * @param rootPath The root path on the server where file operations will be performed.
     *
     * @throws Error if an unsupported protocol is specified.
     */
    constructor(protocol: Protocol = 'ftp', rootPath: string) {
        // Initialize properties
        this.rootPath = rootPath;
        if (protocol === 'sftp') {
            // Create a new SFTP client
            this.client = new SFTPClient();
        } else if (protocol === 'ftp' || protocol === 'ftps') {
            // Create a new FTP client
            this.client = new FTPClient();
        } else {
            throw new Error('Unsupported protocol: ' + protocol);
        }
    }

    /**
     * Connects to the server using the given options.
     *
     * @param options Connection options. If the protocol is "ftp" or "ftps", this is an AccessOptions object.
     *                 If the protocol is "sftp", this is a ConnectOptions object.
     * @returns A promise that resolves when the connection is established.
     */
    async connect(
        options: Protocol extends 'ftp' | 'ftps'
            ? AccessOptions
            : ConnectOptions
    ): Promise<void> {
        return this.client.connect(options);
    }

    /**
     * Lists the files in the given remote directory.
     *
     * @param remoteDir The directory on the server to list. This is appended to the root path specified in the constructor.
     * @returns A promise that resolves with an array of FileInfo objects for each file in the directory.
     */
    async list(remoteDir: string): Promise<any> {
        return this.client.list(this.rootPath + remoteDir);
    }

    /**
     * Downloads a file from the remote server to the local filesystem.
     *
     * @param remoteFile The path to the file on the remote server. This is appended to the root path specified in the constructor.
     * @param localFile The path where the file will be saved locally.
     * @returns A promise that resolves when the download is complete.
     */
    async downloadFile(remoteFile: string, localFile: string): Promise<void> {
        return this.client.downloadFile(this.rootPath + remoteFile, localFile);
    }

    /**
     * Uploads a file from the local filesystem to the remote server.
     *
     * @param localFile The path to the file on the local filesystem.
     * @param remoteFile The path where the file will be saved on the remote server. This is appended to the root path specified in the constructor.
     * @returns A promise that resolves when the upload is complete.
     */
    async uploadFile(localFile: string, remoteFile: string): Promise<void> {
        return this.client.uploadFile(localFile, this.rootPath + remoteFile);
    }

    /**
     * Deletes a file from the remote server.
     *
     * @param remoteFile The path to the file on the remote server. This is appended to the root path specified in the constructor.
     * @returns A promise that resolves when the deletion is complete.
     */
    async deleteFile(remoteFile: string): Promise<void> {
        return this.client.deleteFile(this.rootPath + remoteFile);
    }

    /**
     * Renames a file on the remote server.
     *
     * @param oldPath The current path to the file on the remote server. This is appended to the root path specified in the constructor.
     * @param newPath The new path to rename the file to on the remote server. This is appended to the root path specified in the constructor.
     * @returns A promise that resolves when the rename operation is complete.
     */
    async renameFile(oldPath: string, newPath: string): Promise<void> {
        return this.client.renameFile(
            this.rootPath + oldPath,
            this.rootPath + newPath
        );
    }

    /**
     * Disconnects from the server.
     *
     * @returns A promise that resolves when the connection is closed.
     */
    async disconnect(): Promise<void> {
        return this.client.disconnect();
    }
}
