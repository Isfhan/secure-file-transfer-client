// Import stuff from basic-ftp
import { Client as BasicFtpClient } from 'basic-ftp';
export class FTPClient {
    // Private properties
    client;
    /**
     * Creates a new instance of the FTPClient class.
     *
     * This constructor creates a new instance of the BasicFtpClient class and assigns it to the client property.
     * The client property is then used by the other methods in the class to interact with the FTP server.
     */
    constructor() {
        // Create a new instance of the BasicFtpClient
        this.client = new BasicFtpClient();
    }
    /**
     * Connects to the FTP server using the given options.
     *
     * @param options Options to connect to the FTP server.
     * @returns A promise that resolves when the connection is established.
     */
    async connect(options) {
        await this.client.access(options);
    }
    /**
     * Lists the files in the given remote directory.
     *
     * @param remoteDir Path to the remote directory to list.
     * @returns A promise that resolves with an array of FileInfo objects for each file in the directory.
     */
    async list(remoteDir) {
        return await this.client.list(remoteDir);
    }
    /**
     * Downloads a file from the remote server to the local filesystem.
     *
     * @param remoteFile The path to the file on the remote server.
     * @param localFile The path where the file will be saved locally.
     * @returns A promise that resolves when the download is complete.
     */
    async downloadFile(remoteFile, localFile) {
        await this.client.downloadTo(localFile, remoteFile);
    }
    /**
     * Uploads a file from the local filesystem to the remote server.
     *
     * @param localFile The path to the file on the local filesystem.
     * @param remoteFile The path where the file will be saved on the remote server.
     * @returns A promise that resolves when the upload is complete.
     */
    async uploadFile(localFile, remoteFile) {
        await this.client.uploadFrom(localFile, remoteFile);
    }
    /**
     * Deletes a file from the remote server.
     *
     * @param remoteFile The path to the file on the remote server.
     * @returns A promise that resolves when the deletion is complete.
     */
    async deleteFile(remoteFile) {
        await this.client.remove(remoteFile);
    }
    /**
     * Renames a file on the remote server.
     *
     * @param oldPath The current path to the file on the remote server.
     * @param newPath The new path to rename the file to on the remote server.
     * @returns A promise that resolves when the rename operation is complete.
     */
    async renameFile(oldPath, newPath) {
        await this.client.rename(oldPath, newPath);
    }
    /**
     * Disconnects from the FTP server.
     *
     * @returns A promise that resolves when the connection is closed.
     */
    async disconnect() {
        this.client.close();
    }
}
