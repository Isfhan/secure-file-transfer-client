// Import basic-ftp and ssh2-sftp-client
import { FTPClient } from './ftp-client.js';
import { SFTPClient } from './sftp-client.js';
export class SecureFileTransferClient {
    // Private property
    client;
    /**
     * Constructs a new instance of the SecureFileTransferClient class.
     *
     * @param protocol The protocol to use for file transfer. Supported values are 'ftp', 'ftps', and 'sftp'.
     *                 Defaults to 'ftp'.
     * @param rootPath The root path on the server where file operations will be performed.
     *
     * @throws Error if an unsupported protocol is specified.
     */
    constructor(protocol = 'ftp', rootPath) {
        if (protocol === 'sftp') {
            // Create a new SFTP client
            this.client = new SFTPClient(rootPath);
        }
        else if (protocol === 'ftp' || protocol === 'ftps') {
            // Create a new FTP client
            this.client = new FTPClient(rootPath);
        }
        else {
            throw new Error('Unsupported protocol: ' + protocol);
        }
    }
    /**
     * Connects to the remote server using the given options.
     *
     * @param options The options to use to connect to the remote server. If the protocol is 'ftp' or 'ftps',
     *                this is an AccessOptions object. If the protocol is 'sftp', this is a ConnectOptions object.
     * @returns A promise that resolves when the connection is established.
     * @throws {Error} If connecting to the remote server fails.
     */
    async connect(options) {
        try {
            await this.client.connect(options);
        }
        catch (error) {
            console.error('SecureFileTransferClient: Error connecting:', error);
            throw new Error('SecureFileTransferClient: Connect failed: ' + error.message);
        }
    }
    /**
     * Lists the files and directories in the given remote directory.
     * If no directory is provided, lists the current working directory.
     *
     * @param remoteDir The directory on the server to list. This is relative to the root path specified in the constructor.
     * @returns A promise that resolves with an array of FileInfo objects for each file in the directory.
     * @throws {Error} If listing the directory fails.
     */
    async list(remoteDir) {
        try {
            return await this.client.list(remoteDir);
        }
        catch (error) {
            console.error('SecureFileTransferClient: Error listing directory:', error);
            throw new Error('SecureFileTransferClient: List failed: ' + error.message);
        }
    }
    /**
     * Changes the current working directory on the remote server.
     *
     * @param remoteDir The directory on the server to change to. This is relative to the root path specified in the constructor.
     * @returns A promise that resolves when the directory has been changed.
     * @throws {Error} If changing the directory fails.
     */
    async cd(remoteDir) {
        try {
            await this.client.cd(remoteDir);
        }
        catch (error) {
            console.error('SecureFileTransferClient: Error changing directory:', error);
            throw new Error('SecureFileTransferClient: cd failed: ' + error.message);
        }
    }
    /**
     * Retrieves the current working directory from the remote server.
     *
     * @returns A promise that resolves with the current working directory on the remote server.
     * @throws {Error} If retrieving the current working directory fails.
     */
    async pwd() {
        try {
            return await this.client.pwd();
        }
        catch (error) {
            console.error('SecureFileTransferClient: Error retrieving current directory:', error);
            throw new Error('SecureFileTransferClient: pwd failed: ' + error.message);
        }
    }
    /**
     * Downloads a file from the remote server to the local filesystem.
     *
     * @param remoteFile The path to the file on the remote server.
     * @param localFile The path where the file will be saved locally.
     * @returns A promise that resolves when the download is complete.
     * @throws {Error} If downloading the file fails.
     */
    async downloadFile(remoteFile, localFile) {
        try {
            await this.client.downloadFile(remoteFile, localFile);
        }
        catch (error) {
            console.error('SecureFileTransferClient: Error downloading file:', error);
            throw new Error('SecureFileTransferClient: Download failed: ' + error.message);
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
            await this.client.uploadFile(localFile, remoteFile);
        }
        catch (error) {
            console.error('SecureFileTransferClient: Error uploading file:', error);
            throw new Error('SecureFileTransferClient: Upload failed: ' + error.message);
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
            await this.client.deleteFile(remoteFile);
        }
        catch (error) {
            console.error('SecureFileTransferClient: Error deleting file:', error);
            throw new Error('SecureFileTransferClient: Delete failed: ' + error.message);
        }
    }
    /**
     * Renames a file on the remote server.
     *
     * @param oldPath The current path to the file on the remote server. This is relative to the root path specified in the constructor.
     * @param newPath The new path to rename the file to on the remote server. This is relative to the root path specified in the constructor.
     * @returns A promise that resolves when the rename operation is complete.
     * @throws {Error} If renaming the file fails.
     */
    async renameFile(oldPath, newPath) {
        try {
            await this.client.renameFile(oldPath, newPath);
        }
        catch (error) {
            console.error('SecureFileTransferClient: Error renaming file:', error);
            throw new Error('SecureFileTransferClient: Rename failed: ' + error.message);
        }
    }
    /**
     * Disconnects from the remote server.
     *
     * @returns A promise that resolves when the connection is closed.
     * @throws {Error} If disconnecting from the server fails.
     */
    async disconnect() {
        try {
            await this.client.disconnect();
        }
        catch (error) {
            console.error('SecureFileTransferClient: Error disconnecting:', error);
            throw new Error('SecureFileTransferClient: Disconnect failed: ' + error.message);
        }
    }
}
