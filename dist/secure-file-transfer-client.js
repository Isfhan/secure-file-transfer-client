import { FTPClient } from './ftp-client.js';
import { SFTPClient } from './sftp-client.js';
export class SecureFileTransferClient {
    client;
    constructor(protocol = 'ftp') {
        if (protocol === 'sftp') {
            this.client = new SFTPClient();
        }
        else if (protocol === 'ftp' || protocol === 'ftps') {
            this.client = new FTPClient();
        }
        else {
            throw new Error('Unsupported protocol: ' + protocol);
        }
    }
    async connect(options) {
        return this.client.connect(options);
    }
    async list(remoteDir = '/') {
        return this.client.list(remoteDir);
    }
    async downloadFile(remoteFile, localFile) {
        return this.client.downloadFile(remoteFile, localFile);
    }
    async uploadFile(localFile, remoteFile) {
        return this.client.uploadFile(localFile, remoteFile);
    }
    async deleteFile(remoteFile) {
        return this.client.deleteFile(remoteFile);
    }
    async renameFile(oldPath, newPath) {
        return this.client.renameFile(oldPath, newPath);
    }
    async disconnect() {
        return this.client.disconnect();
    }
}
