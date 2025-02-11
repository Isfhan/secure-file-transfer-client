export interface IFileTransferClient {
    connect(options: any): Promise<void>;
    list(remoteDir?: string): Promise<any>;
    cd(remoteDir: string): Promise<void>;
    pwd(): Promise<string>;
    downloadFile(remoteFile: string, localFile: string): Promise<void>;
    uploadFile(localFile: string, remoteFile: string): Promise<void>;
    deleteFile(remoteFile: string): Promise<void>;
    renameFile(oldPath: string, newPath: string): Promise<void>;
    disconnect(): Promise<void>;
}

export type Protocol = 'ftp' | 'ftps' | 'sftp';
