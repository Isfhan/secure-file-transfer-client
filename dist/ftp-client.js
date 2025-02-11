// Import stuff from basic-ftp
import { Client as BasicFtpClient } from 'basic-ftp';
// Import stuff from utils
import { resolveRemotePath, normalizeDir, mapFTPFileInfo, } from './utils/index.js';
export class FTPClient {
    // Private properties
    client;
    basePath;
    currentDir;
    /**
     * Creates a new instance of the FTPClient.
     *
     * @param rootPath - The root directory that will be used as the base for all operations.
     * For example: "/var/www/vhosts/yourdomain.com/ftp/"
     */
    constructor(rootPath) {
        this.client = new BasicFtpClient();
        this.basePath = normalizeDir(rootPath);
        this.currentDir = this.basePath;
    }
    /**
     * Connects to the FTP server using the given options.
     *
     * @param options - The options to use to connect to the FTP server.
     * @returns A promise that resolves when the connection is established.
     * @throws {Error} If connecting to the FTP server fails.
     */
    async connect(options) {
        try {
            await this.client.access(options);
        }
        catch (error) {
            console.error('FTPClient: Error connecting to FTP server:', error);
            throw new Error('FTPClient: Connection failed: ' + error.message);
        }
    }
    /**
     * Lists the files and directories in the specified remote directory.
     * If no directory is provided, lists the current working directory.
     *
     * @param remoteDir - Optional remote directory.
     * @returns A promise that resolves with an array of ItemInfo objects.
     * @throws {Error} If listing the directory fails.
     */
    async list(remoteDir) {
        try {
            const dirToResolve = remoteDir ?? '';
            const path = resolveRemotePath(this.basePath, this.currentDir, dirToResolve);
            const rawList = await this.client.list(path);
            return rawList.map(mapFTPFileInfo);
        }
        catch (error) {
            console.error('FTPClient: Error listing directory:', error);
            throw new Error('FTPClient: List failed: ' + error.message);
        }
    }
    /**
     * Changes the current working directory on the FTP server.
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
    async cd(remoteDir) {
        try {
            let newDir;
            if (remoteDir.startsWith('/')) {
                newDir = resolveRemotePath(this.basePath, this.basePath, remoteDir);
            }
            else {
                newDir = resolveRemotePath(this.basePath, this.currentDir, remoteDir);
            }
            await this.client.cd(newDir);
            this.currentDir = newDir;
            console.log(`FTPClient: current directory set to ${this.currentDir}`);
        }
        catch (error) {
            console.error('FTPClient: Error changing directory:', error);
            throw new Error('FTPClient: cd failed: ' + error.message);
        }
    }
    /**
     * Retrieves the current working directory from the FTP server.
     *
     * @returns The current directory path.
     * @throws {Error} If retrieving the current directory fails.
     */
    async pwd() {
        try {
            const dir = await this.client.pwd();
            this.currentDir = normalizeDir(dir);
            return this.currentDir;
        }
        catch (error) {
            console.error('FTPClient: Error retrieving current directory:', error);
            throw new Error('FTPClient: pwd failed: ' + error.message);
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
    async downloadFile(remoteFile, localFile) {
        try {
            const path = resolveRemotePath(this.basePath, this.currentDir, remoteFile);
            await this.client.downloadTo(localFile, path);
        }
        catch (error) {
            console.error('FTPClient: Error downloading file:', error);
            throw new Error('FTPClient: Download failed: ' + error.message);
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
    async uploadFile(localFile, remoteFile) {
        try {
            const path = resolveRemotePath(this.basePath, this.currentDir, remoteFile);
            await this.client.uploadFrom(localFile, path);
        }
        catch (error) {
            console.error('FTPClient: Error uploading file:', error);
            throw new Error('FTPClient: Upload failed: ' + error.message);
        }
    }
    /**
     * Deletes a file from the remote server.
     *
     * @param remoteFile The path to the file on the remote server. This is relative to the root path specified in the constructor.
     * @returns A promise that resolves when the deletion is complete.
     * @throws {Error} If deleting the file fails.
     */
    async deleteFile(remoteFile) {
        try {
            const path = resolveRemotePath(this.basePath, this.currentDir, remoteFile);
            await this.client.remove(path);
        }
        catch (error) {
            console.error('FTPClient: Error deleting file:', error);
            throw new Error('FTPClient: Delete failed: ' + error.message);
        }
    }
    /**
     * Renames a file on the remote server.
     * Both old and new file paths are resolved against the current directory.
     *
     * @param {string} oldPath - The current path of the file.
     * @param {string} newPath - The new path for the file.
     * @returns {Promise<void>} A promise that resolves when the rename operation is complete.
     * @throws {Error} If renaming the file fails.
     */
    async renameFile(oldPath, newPath) {
        try {
            const resolvedOld = resolveRemotePath(this.basePath, this.currentDir, oldPath);
            const resolvedNew = resolveRemotePath(this.basePath, this.currentDir, newPath);
            await this.client.rename(resolvedOld, resolvedNew);
        }
        catch (error) {
            console.error('FTPClient: Error renaming file:', error);
            throw new Error('FTPClient: Rename failed: ' + error.message);
        }
    }
    /**
     * Disconnects from the FTP server.
     *
     * @returns A promise that resolves when the connection is closed.
     * @throws {Error} If disconnecting from the server fails.
     */
    async disconnect() {
        try {
            this.client.close();
        }
        catch (error) {
            console.error('FTPClient: Error disconnecting:', error);
            throw new Error('FTPClient: Disconnect failed: ' + error.message);
        }
    }
}
