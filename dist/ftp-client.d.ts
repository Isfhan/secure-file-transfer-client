import { AccessOptions } from 'basic-ftp';
import { IFileTransferClient, ItemInfo } from './types/index.js';
export declare class FTPClient implements IFileTransferClient {
    private client;
    private basePath;
    private currentDir;
    /**
     * Creates a new instance of the FTPClient.
     *
     * @param rootPath - The root directory that will be used as the base for all operations.
     * For example: "/var/www/vhosts/yourdomain.com/ftp/"
     */
    constructor(rootPath: string);
    /**
     * Connects to the FTP server using the given options.
     *
     * @param options - The options to use to connect to the FTP server.
     * @returns A promise that resolves when the connection is established.
     * @throws {Error} If connecting to the FTP server fails.
     */
    connect(options: AccessOptions): Promise<void>;
    /**
     * Lists the files and directories in the specified remote directory.
     * If no directory is provided, lists the current working directory.
     *
     * @param remoteDir - Optional remote directory.
     * @returns A promise that resolves with an array of ItemInfo objects.
     * @throws {Error} If listing the directory fails.
     */
    list(remoteDir?: string): Promise<ItemInfo[]>;
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
    cd(remoteDir: string): Promise<void>;
    /**
     * Retrieves the current working directory from the FTP server.
     *
     * @returns The current directory path.
     * @throws {Error} If retrieving the current directory fails.
     */
    pwd(): Promise<string>;
    /**
     * Downloads a file from the remote server to the local filesystem.
     *
     * @param remoteFile The path to the file on the remote server. This is relative to the root path specified in the constructor.
     * @param localFile The path where the file will be saved locally.
     * @returns A promise that resolves when the download is complete.
     * @throws {Error} If downloading the file fails.
     */
    downloadFile(remoteFile: string, localFile: string): Promise<void>;
    /**
     * Uploads a file from the local filesystem to the remote server.
     *
     * @param localFile The path to the file on the local filesystem.
     * @param remoteFile The path where the file will be saved on the remote server. This is relative to the root path specified in the constructor.
     * @returns A promise that resolves when the upload is complete.
     * @throws {Error} If uploading the file fails.
     */
    uploadFile(localFile: string, remoteFile: string): Promise<void>;
    /**
     * Deletes a file from the remote server.
     *
     * @param remoteFile The path to the file on the remote server. This is relative to the root path specified in the constructor.
     * @returns A promise that resolves when the deletion is complete.
     * @throws {Error} If deleting the file fails.
     */
    deleteFile(remoteFile: string): Promise<void>;
    /**
     * Renames a file on the remote server.
     * Both old and new file paths are resolved against the current directory.
     *
     * @param {string} oldPath - The current path of the file.
     * @param {string} newPath - The new path for the file.
     * @returns {Promise<void>} A promise that resolves when the rename operation is complete.
     * @throws {Error} If renaming the file fails.
     */
    renameFile(oldPath: string, newPath: string): Promise<void>;
    /**
     * Disconnects from the FTP server.
     *
     * @returns A promise that resolves when the connection is closed.
     * @throws {Error} If disconnecting from the server fails.
     */
    disconnect(): Promise<void>;
}
