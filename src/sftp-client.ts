// Import stuff from ssh2-sftp-client
import SftpClientLib from 'ssh2-sftp-client';

// Import stuff from utils
import {
    resolveRemotePath,
    normalizeDir,
    mapSFTPFileInfo,
} from './utils/index.js';

// Import types
import { IFileTransferClient, ItemInfo } from './types/index.js';
import type { ConnectOptions, FileInfo } from 'ssh2-sftp-client';

export class SFTPClient implements IFileTransferClient {
    // Private properties
    private client: SftpClientLib;
    private basePath: string;
    private currentDir: string;

    /**
     * Creates a new instance of the SFTPClient.
     *
     * @param rootPath - The root directory that will be used as the base for all operations.
     * For example: "/var/www/vhosts/yourdomain.com/ftp/"
     */
    constructor(rootPath: string) {
        this.client = new SftpClientLib();
        this.basePath = normalizeDir(rootPath);
        this.currentDir = normalizeDir(rootPath);
    }

    /**
     * Connects to the SFTP server using the provided options.
     *
     * @param options - Connection options for the SFTP server.
     * @returns A promise that resolves when the connection is established.
     * @throws {Error} If connecting to the SFTP server fails.
     */
    async connect(options: ConnectOptions): Promise<void> {
        try {
            await this.client.connect(options);
        } catch (error: any) {
            console.error(
                'SFTPClient: Error connecting to SFTP server:',
                error
            );
            throw new Error('SFTPClient: Connection failed: ' + error.message);
        }
    }

    /**
     * Lists the files and directories in the specified remote directory.
     * If no directory is provided, lists the current working directory.
     *
     * @param remoteDir - Optional remote directory (relative or absolute).
     * @returns A promise that resolves with an array of FileInfo objects.
     * @throws {Error} If listing the directory fails.
     */
    async list(remoteDir?: string): Promise<ItemInfo[]> {
        try {
            const dirToResolve = remoteDir ?? '';
            const path = resolveRemotePath(
                this.basePath,
                this.currentDir,
                dirToResolve
            );
            const rawList: FileInfo[] = await this.client.list(path);
            return rawList.map(mapSFTPFileInfo);
        } catch (error: any) {
            console.error('SFTPClient: Error listing directory:', error);
            throw new Error('SFTPClient: List failed: ' + error.message);
        }
    }

    /**
     * Changes the current working directory on the remote server.
     *
     * If the provided path starts with '/', it is treated as absolute relative to the root path.
     * Otherwise, it is appended to the current directory.
     * This method normalizes the resulting path to avoid extra slashes.
     *
     * Examples:
     * - If the root path is "/var/www/vhosts/example.com/ftp/" and the user calls
     *   cd("/example/directory"), the new currentDir becomes:
     *   "/var/www/vhosts/example.com/ftp/example/directory"
     * - If the user calls cd("example/directory"), it is joined with the currentDir.
     *
     * @param {string} remoteDir - The directory path to navigate to
     * @returns {Promise<void>} Promise that resolves when directory is changed
     * @throws {Error} If changing the directory fails
     */
    async cd(remoteDir: string): Promise<void> {
        try {
            let newDir: string;
            if (remoteDir.startsWith('/')) {
                newDir = resolveRemotePath(
                    this.basePath,
                    this.basePath,
                    remoteDir
                );
            } else {
                newDir = resolveRemotePath(
                    this.basePath,
                    this.currentDir,
                    remoteDir
                );
            }
            this.currentDir = newDir;
            console.log(
                `SFTPClient: current directory set to ${this.currentDir}`
            );
        } catch (error: any) {
            console.error('SFTPClient: Error changing directory:', error);
            throw new Error('SFTPClient: cd failed: ' + error.message);
        }
    }

    /**
     * Retrieves the current working directory from the remote server.
     *
     * @returns The current directory path.
     * @throws {Error} If retrieving the current directory fails.
     */
    async pwd(): Promise<string> {
        try {
            return Promise.resolve(this.currentDir);
        } catch (error: any) {
            console.error(
                'SFTPClient: Error retrieving current directory:',
                error
            );
            throw new Error('SFTPClient: pwd failed: ' + error.message);
        }
    }

    /**
     * Downloads a file from the remote server to the local filesystem.
     *
     * @param remoteFile The path to the file on the remote server. This is relative to the root path specified in the constructor.
     * @param localFile The path where the file will be saved locally.
     * @returns A promise that resolves when the download is complete.
     * @throws {Error} If downloading the file fails.
     */
    async downloadFile(remoteFile: string, localFile: string): Promise<void> {
        try {
            const path = resolveRemotePath(
                this.basePath,
                this.currentDir,
                remoteFile
            );
            await this.client.get(path, localFile);
        } catch (error: any) {
            console.error('SFTPClient: Error downloading file:', error);
            throw new Error('SFTPClient: Download failed: ' + error.message);
        }
    }

    /**
     * Uploads a file from the local filesystem to the remote server.
     *
     * @param localFile The path to the file on the local filesystem.
     * @param remoteFile The path where the file will be saved on the remote server. This is relative to the root path specified in the constructor.
     * @returns A promise that resolves when the upload is complete.
     * @throws {Error} If uploading the file fails.
     */
    async uploadFile(localFile: string, remoteFile: string): Promise<void> {
        try {
            const path = resolveRemotePath(
                this.basePath,
                this.currentDir,
                remoteFile
            );
            await this.client.put(localFile, path);
        } catch (error: any) {
            console.error('SFTPClient: Error uploading file:', error);
            throw new Error('SFTPClient: Upload failed: ' + error.message);
        }
    }

    /**
     * Deletes a file from the remote server.
     *
     * @param remoteFile The path to the file on the remote server. This is relative to the root path specified in the constructor.
     * @returns A promise that resolves when the deletion is complete.
     * @throws {Error} If deleting the file fails.
     */
    async deleteFile(remoteFile: string): Promise<void> {
        try {
            const path = resolveRemotePath(
                this.basePath,
                this.currentDir,
                remoteFile
            );
            await this.client.delete(path);
        } catch (error: any) {
            console.error('SFTPClient: Error deleting file:', error);
            throw new Error('SFTPClient: Delete failed: ' + error.message);
        }
    }

    /**
     * Renames a file on the SFTP server.
     * Both old and new file paths are resolved against the current directory.
     *
     * @param {string} oldPath - The current path of the file.
     * @param {string} newPath - The new path for the file.
     * @returns {Promise<void>} A promise that resolves when the rename operation is complete.
     * @throws {Error} If renaming the file fails.
     */
    async renameFile(oldPath: string, newPath: string): Promise<void> {
        try {
            const resolvedOld = resolveRemotePath(
                this.basePath,
                this.currentDir,
                oldPath
            );
            const resolvedNew = resolveRemotePath(
                this.basePath,
                this.currentDir,
                newPath
            );
            await this.client.rename(resolvedOld, resolvedNew);
        } catch (error: any) {
            console.error('SFTPClient: Error renaming file:', error);
            throw new Error('SFTPClient: Rename failed: ' + error.message);
        }
    }

    /**
     * Disconnects from the SFTP server.
     *
     * @returns A promise that resolves when the connection is closed.
     * @throws {Error} If disconnecting from the server fails.
     */
    async disconnect(): Promise<void> {
        try {
            await this.client.end();
        } catch (error: any) {
            console.error('SFTPClient: Error disconnecting:', error);
            throw new Error('SFTPClient: Disconnect failed: ' + error.message);
        }
    }
}
