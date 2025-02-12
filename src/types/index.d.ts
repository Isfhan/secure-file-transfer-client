// Represents a file transfer client
export interface IFileTransferClient {
    connect(options: any): Promise<void>;
    list(remoteDir?: string): Promise<ItemInfo[]>;
    cd(remoteDir: string): Promise<void>;
    pwd(): Promise<string>;
    downloadFile(remoteFile: string, localFile: string): Promise<void>;
    uploadFile(localFile: string, remoteFile: string): Promise<void>;
    deleteFile(remoteFile: string): Promise<void>;
    renameFile(oldPath: string, newPath: string): Promise<void>;
    disconnect(): Promise<void>;
}

// Represents the protocol used to connect to the remote server.
export type Protocol = 'ftp' | 'ftps' | 'sftp';

// Represents a file or directory item returned by FTP/SFTP list operations.
export interface ItemInfo {
    name: string;
    type: 'file' | 'directory' | 'symlink' | 'unknown';
    size: number;
    modifiedAt: Date | undefined;
    owner?: string | number;
    group?: string | number;
    permissions?:
        | {
              user: string | number;
              group: string | number;
              other: string | number;
          }
        | undefined;
    isDirectory: boolean;
    isFile: boolean;
}

// Represents the normalized file type
interface NormalizedType {
    type: 'file' | 'directory' | 'symlink' | 'unknown';
    isDirectory: boolean;
    isFile: boolean;
}
