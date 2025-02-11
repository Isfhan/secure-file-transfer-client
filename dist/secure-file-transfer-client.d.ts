import { IFileTransferClient, ItemInfo, Protocol } from './types/index.js';
import type { AccessOptions } from 'basic-ftp';
import type { ConnectOptions } from 'ssh2-sftp-client';
export declare class SecureFileTransferClient implements IFileTransferClient {
    private client;
    /**
     * Constructs a new instance of the SecureFileTransferClient class.
     *
     * @param protocol The protocol to use for file transfer. Supported values are 'ftp', 'ftps', and 'sftp'.
     *                 Defaults to 'ftp'.
     * @param rootPath The root path on the server where file operations will be performed.
     *
     * @throws Error if an unsupported protocol is specified.
     */
    constructor(protocol: Protocol | undefined, rootPath: string);
    /**
     * Connects to the remote server using the given options.
     *
     * @param options The options to use to connect to the remote server. If the protocol is 'ftp' or 'ftps',
     *                this is an AccessOptions object. If the protocol is 'sftp', this is a ConnectOptions object.
     * @returns A promise that resolves when the connection is established.
     * @throws {Error} If connecting to the remote server fails.
     */
    connect(options: Protocol extends 'ftp' | 'ftps' ? AccessOptions : ConnectOptions): Promise<void>;
    /**
     * Lists the files and directories in the given remote directory.
     * If no directory is provided, lists the current working directory.
     *
     * @param remoteDir The directory on the server to list. This is relative to the root path specified in the constructor.
     * @returns A promise that resolves with an array of ItemInfo objects for each file in the directory.
     * @throws {Error} If listing the directory fails.
     */
    list(remoteDir?: string): Promise<ItemInfo[]>;
    /**
     * Changes the current working directory on the remote server.
     *
     * @param remoteDir The directory on the server to change to. This is relative to the root path specified in the constructor.
     * @returns A promise that resolves when the directory has been changed.
     * @throws {Error} If changing the directory fails.
     */
    cd(remoteDir: string): Promise<void>;
    /**
     * Retrieves the current working directory from the remote server.
     *
     * @returns A promise that resolves with the current working directory on the remote server.
     * @throws {Error} If retrieving the current working directory fails.
     */
    pwd(): Promise<string>;
    /**
     * Downloads a file from the remote server to the local filesystem.
     *
     * @param remoteFile The path to the file on the remote server.
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
     *
     * @param oldPath The current path to the file on the remote server. This is relative to the root path specified in the constructor.
     * @param newPath The new path to rename the file to on the remote server. This is relative to the root path specified in the constructor.
     * @returns A promise that resolves when the rename operation is complete.
     * @throws {Error} If renaming the file fails.
     */
    renameFile(oldPath: string, newPath: string): Promise<void>;
    /**
     * Disconnects from the remote server.
     *
     * @returns A promise that resolves when the connection is closed.
     * @throws {Error} If disconnecting from the server fails.
     */
    disconnect(): Promise<void>;
}
