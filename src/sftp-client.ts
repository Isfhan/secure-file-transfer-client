// Import stuff from ssh2-sftp-client
import SftpClientLib from 'ssh2-sftp-client';

// Import types
import { IFileTransferClient } from './types/index.js';
import type { ConnectOptions, FileInfo } from 'ssh2-sftp-client';

export class SFTPClient implements IFileTransferClient {
    private client: SftpClientLib;

    /**
     * Creates a new instance of the SFTPClient class.
     *
     * This constructor creates a new instance of the SftpClientLib class and assigns it to the client property.
     * The client property is then used by the other methods in the class to interact with the SFTP server.
     */
    constructor() {
        // Create a new instance of the SftpClientLib
        this.client = new SftpClientLib();
    }

    /**
     * Connects to the SFTP server using the given options.
     *
     * @param options Options to connect to the SFTP server.
     * @returns A promise that resolves when the connection is established.
     */
    async connect(options: ConnectOptions): Promise<void> {
        await this.client.connect(options);
    }

    /**
     * Lists the files in the given remote directory.
     *
     * @param remoteDir Path to the remote directory to list.
     * @returns A promise that resolves with an array of FileInfo objects for each file in the directory.
     */
    async list(remoteDir: string): Promise<FileInfo[]> {
        return await this.client.list(remoteDir);
    }

    /**
     * Downloads a file from the remote SFTP server to the local filesystem.
     *
     * @param remoteFile The path to the file on the remote server.
     * @param localFile The path where the file will be saved locally.
     * @returns A promise that resolves when the download is complete.
     */
    async downloadFile(remoteFile: string, localFile: string): Promise<void> {
        await this.client.get(remoteFile, localFile);
    }

    /**
     * Uploads a file from the local filesystem to the remote SFTP server.
     *
     * @param localFile The path to the file on the local filesystem.
     * @param remoteFile The path where the file will be saved on the remote server.
     * @returns A promise that resolves when the upload is complete.
     */
    async uploadFile(localFile: string, remoteFile: string): Promise<void> {
        await this.client.put(localFile, remoteFile);
    }

    /**
     * Deletes a file from the remote SFTP server.
     *
     * @param remoteFile The path to the file on the remote server.
     * @returns A promise that resolves when the deletion is complete.
     */
    async deleteFile(remoteFile: string): Promise<void> {
        await this.client.delete(remoteFile);
    }

    /**
     * Renames a file on the remote SFTP server.
     *
     * @param oldPath The current path to the file on the remote server.
     * @param newPath The new path to rename the file to on the remote server.
     * @returns A promise that resolves when the rename operation is complete.
     */
    async renameFile(oldPath: string, newPath: string): Promise<void> {
        await this.client.rename(oldPath, newPath);
    }

    /**
     * Disconnects from the SFTP server.
     *
     * @returns A promise that resolves when the connection is closed.
     */
    async disconnect(): Promise<void> {
        await this.client.end();
    }
}
