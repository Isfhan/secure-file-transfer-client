import { FTPClient } from './ftp-client.js';
import { SFTPClient } from './sftp-client.js';

import { IFileTransferClient, Protocol } from './types/index.js';

export class SecureFileTransferClient implements IFileTransferClient {
    private client: IFileTransferClient;

    constructor(protocol: Protocol = 'ftp') {
        if (protocol === 'sftp') {
            this.client = new SFTPClient();
        } else if (protocol === 'ftp' || protocol === 'ftps') {
            this.client = new FTPClient();
        } else {
            throw new Error('Unsupported protocol: ' + protocol);
        }
    }

    async connect(options: any): Promise<void> {
        return this.client.connect(options);
    }

    async list(remoteDir: string = '/'): Promise<any> {
        return this.client.list(remoteDir);
    }

    async downloadFile(remoteFile: string, localFile: string): Promise<void> {
        return this.client.downloadFile(remoteFile, localFile);
    }

    async uploadFile(localFile: string, remoteFile: string): Promise<void> {
        return this.client.uploadFile(localFile, remoteFile);
    }

    async deleteFile(remoteFile: string): Promise<void> {
        return this.client.deleteFile(remoteFile);
    }

    async renameFile(oldPath: string, newPath: string): Promise<void> {
        return this.client.renameFile(oldPath, newPath);
    }

    async disconnect(): Promise<void> {
        return this.client.disconnect();
    }
}
