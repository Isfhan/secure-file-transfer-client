# Secure File Transfer Client

**Secure File Transfer Client** is an open‐source npm package that abstracts
away the complexities of using multiple file transfer protocols. It leverages
[basic‑ftp](https://www.npmjs.com/package/basic-ftp) for FTP/FTPS and
[ssh2‑sftp‑client](https://www.npmjs.com/package/ssh2-sftp-client) for SFTP,
providing a unified, secure API for common file operations.

## Features

-   **Unified API:** A consistent interface for connecting, listing, uploading,
    downloading, renaming, and deleting files.
-   **Protocol Support:** Easily switch between FTP, FTPS, and SFTP by changing
    a configuration value.
-   **Secure Transfers:** Configure secure options for FTPS and SFTP to ensure
    safe data transfers.
-   **TypeScript:** Written in TypeScript to provide strong typing and a better
    developer experience.
-   **Open Source:** Freely available under the MIT License.

## Installation

Install via npm:

```bash
npm install secure-file-transfer-client
```

## Usage

Below is a basic example using the package. In this example, the client is
instantiated with a chosen protocol and a root path for remote operations. The
same unified API is used regardless of whether FTP, FTPS, or SFTP is selected.

```ts
import { SecureFileTransferClient } from 'secure-file-transfer-client';
import type { AccessOptions } from 'basic-ftp';
import type { ConnectOptions } from 'ssh2-sftp-client';

// Example for FTP/FTPS:
const ftpOptions: AccessOptions = {
    host: 'ftp.example.com',
    user: 'username',
    password: 'password',
    secure: false, // set to true for FTPS
};

// Example for SFTP (uncomment if using SFTP):
// const sftpOptions: ConnectOptions = {
//   host: 'sftp.example.com',
//   username: 'username',
//   password: 'password'
// };

// Instantiate the client with the protocol and a root path:
const client = new SecureFileTransferClient('ftp', '/remote/path/');
// For SFTP, use 'sftp':
// const client = new SecureFileTransferClient('sftp', '/remote/path/');

(async () => {
    try {
        // Connect using the appropriate options:
        await client.connect(ftpOptions); // or sftpOptions for SFTP

        // List files in the remote directory (relative to the root path)
        const files = await client.list('/');
        console.log('Remote files:', files);

        // Upload a local file to the remote server:
        await client.uploadFile('./local.txt', 'upload.txt');

        // Download a remote file to a local path:
        await client.downloadFile('download.txt', './downloaded.txt');

        // Rename a remote file:
        await client.renameFile('old.txt', 'new.txt');

        // Delete a remote file:
        await client.deleteFile('delete.txt');
    } catch (error) {
        console.error('Transfer error:', error);
    } finally {
        // Disconnect from the server:
        await client.disconnect();
        console.log('Connection closed');
    }
})();
```

## API Documentation

### Constructor

```ts
new SecureFileTransferClient(protocol: 'ftp' | 'ftps' | 'sftp', rootPath: string)
```

-   **protocol:** The protocol to use for file transfers (`ftp`, `ftps`, or
    `sftp`).
-   **rootPath:** The base path on the remote server where all file operations
    will be performed.

### Methods

-   **connect(options: AccessOptions | ConnectOptions): Promise<void>**  
    Establish a connection to the server. Use `AccessOptions` (from basic-ftp)
    for FTP/FTPS or `ConnectOptions` (from ssh2-sftp-client) for SFTP.

-   **list(remoteDir: string): Promise<any>**  
    List files in the specified remote directory (appended to the root path).

-   **downloadFile(remoteFile: string, localFile: string): Promise<void>**  
    Download a file from the remote server (remoteFile path appended to the root
    path) to a local path.

-   **uploadFile(localFile: string, remoteFile: string): Promise<void>**  
    Upload a local file to the remote server (remoteFile path appended to the
    root path).

-   **deleteFile(remoteFile: string): Promise<void>**  
    Delete a file on the remote server (remoteFile path appended to the root
    path).

-   **renameFile(oldPath: string, newPath: string): Promise<void>**  
    Rename a remote file. Both paths are relative to the root path.

-   **disconnect(): Promise<void>**  
    Close the connection to the server.

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please submit issues and pull requests for any bug
fixes, improvements, or new features.
