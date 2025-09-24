# Secure File Transfer Client

**Secure File Transfer Client** is an open-source npm package that provides a
unified API for transferring files using FTP, FTPS, and SFTP protocols. It
leverages [basic‑ftp](https://www.npmjs.com/package/basic-ftp) for FTP/FTPS and
[ssh2‑sftp‑client](https://www.npmjs.com/package/ssh2-sftp-client) for SFTP,
ensuring a consistent experience regardless of the underlying protocol.

The package is written in TypeScript and incorporates robust error handling
throughout its API methods, making it both developer-friendly and reliable.

## Features

-   **Unified API:** Use the same methods for connecting, listing, uploading,
    downloading, renaming, deleting, changing directories, and retrieving the
    current directory.

-   **Protocol Flexibility:** Easily switch between FTP, FTPS, and SFTP by
    setting a configuration value.

-   **Consistent Path Resolution:** All file operations are anchored relative to
    a configurable root path and current working directory using shared utility
    functions.

-   **Robust Error Handling:** Every method wraps operations in try/catch blocks
    to provide meaningful error messages with context.

-   **TypeScript:** Provides strong typing for a robust developer experience.

-   **Proxy Support (since v1.5.0):** Built-in support for SOCKS4/5 and
    HTTP/HTTPS CONNECT proxies for SFTP connections.

-   **Open Source:** Licensed under the MIT License.

## Installation

Install via npm:

```bash
npm install secure-file-transfer-client
```

## Usage Example

Below is a basic example demonstrating how to use the Secure File Transfer
Client:

```ts
import { SecureFileTransferClient } from 'secure-file-transfer-client';
import type { AccessOptions } from 'basic-ftp';
import type { ConnectOptions } from 'ssh2-sftp-client';

// Example options for FTP/FTPS:
const ftpOptions: AccessOptions = {
    host: 'ftp.example.com',
    user: 'username',
    password: 'password',
    secure: false, // Set to true for FTPS
};

// Example options for SFTP (uncomment if using SFTP):
// const sftpOptions: ConnectOptions = {
//   host: 'sftp.example.com',
//   username: 'username',
//   password: 'password'
// };

// Example options for SFTP with proxy support:
// const sftpOptionsWithProxy: ConnectOptions & { proxy?: ProxyOption } = {
//   host: 'sftp.example.com',
//   username: 'username',
//   password: 'password',
//   proxy: {
//     enabled: true,
//     type: 'https', // 'socks5', 'socks4', 'http', or 'https'
//     host: 'proxy.example.com',
//     port: 8080,
//     username: 'proxy_user',
//     password: 'proxy_pass',
//     dedicated_ip: 'proxy.example.com',
//     location: 'Germany',
//     service_type: 'fresh',
//     secureRejectUnauthorized: false // For HTTPS proxies with custom certs
//   }
// };

// Instantiate the client with the protocol and a root path.
// The rootPath is used as the base for all operations.
const client = new SecureFileTransferClient(
    'sftp',
    '/var/www/vhosts/yourdomain.com/ftp/'
);

(async () => {
    try {
        // Connect using the appropriate options (ftpOptions for FTP/FTPS or sftpOptions for SFTP)
        // For SFTP with proxy, use sftpOptionsWithProxy instead
        await client.connect(ftpOptions);
        console.log('Connected successfully.');

        // List files in the current working directory:
        const files = await client.list();
        console.log('Files:', files);

        // Change the current working directory:
        await client.cd('/carrier/');
        console.log('Changed working directory.');

        // Retrieve the current working directory:
        const currentDir = await client.pwd();
        console.log('Current Directory:', currentDir);

        // Upload a file:
        await client.uploadFile('./local.txt', 'upload.txt');
        console.log('File uploaded.');

        // Download a file:
        await client.downloadFile('download.txt', './downloaded.txt');
        console.log('File downloaded.');

        // Rename a file:
        await client.renameFile('old.txt', 'new.txt');
        console.log('File renamed.');

        // Delete a file:
        await client.deleteFile('delete.txt');
        console.log('File deleted.');
    } catch (error) {
        console.error('Transfer error:', error);
    } finally {
        await client.disconnect();
        console.log('Connection closed.');
    }
})();
```

## API Overview

### Constructor

```ts
new SecureFileTransferClient(protocol: 'ftp' | 'ftps' | 'sftp', rootPath: string)
```

-   **protocol:** The protocol to use (`ftp`, `ftps`, or `sftp`).
-   **rootPath:** The base directory on the remote server where all operations
    are anchored.

### Methods

-   **connect(options: AccessOptions | ConnectOptions): Promise<void>**
    Establish a connection to the server. Use `AccessOptions` for FTP/FTPS and
    `ConnectOptions` for SFTP. _Error handling:_ Errors during connection are
    caught and logged with context.

-   **list(remoteDir?: string): Promise<any>** List files in the specified
    directory. If no directory is provided, lists the current working directory.
    _Error handling:_ Errors in listing are caught and rethrown with an
    informative message.

-   **cd(remoteDir: string): Promise<void>** Change the current working
    directory. If the path starts with '/', it is resolved relative to the
    rootPath; otherwise, it is appended to the current directory. _Error
    handling:_ Directory change errors are caught and logged.

-   **pwd(): Promise<string>** Returns the current working directory as
    maintained by the client.

-   **downloadFile(remoteFile: string, localFile: string): Promise<void>**
    Downloads a file from the remote server (remoteFile is resolved relative to
    the current directory) to a local path. _Error handling:_ Download errors
    are caught and reported.

-   **uploadFile(localFile: string, remoteFile: string): Promise<void>** Uploads
    a file from the local filesystem to the remote server (remoteFile is
    resolved relative to the current directory). _Error handling:_ Upload errors
    are caught and rethrown with context.

-   **deleteFile(remoteFile: string): Promise<void>** Deletes a file from the
    remote server (remoteFile is resolved relative to the current directory).
    _Error handling:_ Deletion errors are caught and reported.

-   **renameFile(oldPath: string, newPath: string): Promise<void>** Renames a
    file on the remote server (both paths are resolved relative to the current
    directory). _Error handling:_ Rename errors are caught and rethrown with
    context.

-   **disconnect(): Promise<void>** Disconnects from the server. _Error
    handling:_ Disconnect errors are caught and logged.

### Proxy Support (SFTP Only) (added in version 1.5.0)

The SFTP client supports connecting through various proxy types:

### Unified File Listing with ItemInfo (added in version 1.1.0)

File listings now return a standardized structure defined by the `ItemInfo`
interface. This interface unifies file information across FTP and SFTP by
mapping raw file info into a common format with properties such as `name`,
`type`, `size`, `modifiedAt`, `owner`, `group`, `permissions`, and boolean flags
`isDirectory` and `isFile`.  
Both the FTP and SFTP clients use mapping functions (`mapFTPFileInfo` and
`mapSFTPFileInfo`) to convert the underlying file info into `ItemInfo[]`,
ensuring a consistent API for file listings.

### Supported Proxy Types

-   **SOCKS4/SOCKS5**: Traditional SOCKS proxies with optional TLS wrapping
-   **HTTP/HTTPS CONNECT**: HTTP proxies using the CONNECT method for tunneling

### Proxy Configuration

```ts
import type { ProxyOption } from 'secure-file-transfer-client';

const proxyConfig: ProxyOption = {
    enabled: true,
    type: 'https', // 'socks5', 'socks4', 'http', or 'https'
    host: 'proxy.example.com',
    port: 8080,
    username: 'proxy_user',
    password: 'proxy_pass',
    dedicated_ip: 'proxy.example.com',
    location: 'Germany',
    service_type: 'fresh',
    secureRejectUnauthorized: false, // For HTTPS proxies with custom certificates
    secure: true,
};
```

### Proxy Type Details

**SOCKS4/5 Proxies:**

-   Use `type: 'socks4'` or `type: 'socks5'`
-   For TLS-wrapped SOCKS proxies, set `secure: true`
-   Control TLS verification with `secureRejectUnauthorized`

**HTTP/HTTPS CONNECT Proxies:**

-   Use `type: 'http'` for plain HTTP proxies
-   Use `type: 'https'` for HTTPS proxies (TLS-encrypted connection to proxy)
-   Authentication via `username`/`password` using Basic Auth
-   For HTTPS proxies with custom certificates, set
    `secureRejectUnauthorized: false`

### Example Usage

```ts
const client = new SecureFileTransferClient('sftp', '/remote/path');

await client.connect({
    host: 'sftp.example.com',
    username: 'user',
    password: 'pass',
    proxy: {
        enabled: true,
        type: 'https',
        host: 'proxy.example.com',
        port: 9443,
        username: 'proxy_user',
        password: 'proxy_pass',
        secureRejectUnauthorized: false,
        dedicated_ip: 'proxy.example.com',
        location: 'Germany',
        service_type: 'fresh',
        secure: true,
    },
});
```

## Testing

A comprehensive set of tests is included to ensure all functionality works as
expected. To build and run the tests, use:

```bash
npm run build
npm run test
```

### Environment Configuration

Create a `.env` file (you can start from `.env.example`) to supply connection
and optional proxy settings used by the tests:

```env
# Protocol: ftp | ftps | sftp
PROTOCOL=sftp

# Server credentials
HOST=your.sftp.server
USER=username
PASSWORD=password

# Base remote path for operations (used as root)
ROOT_PATH=/remote/base/path

# Optional: environment (affects FTPS cert verification in tests)
NODE_ENV=development

# Optional: Proxy settings (SFTP only)
PROXY_ENABLED=false
PROXY_TYPE=https # socks5 | socks4 | http | https
PROXY_HOST=proxy.example.com
PROXY_PORT=9443
PROXY_USERNAME=
PROXY_PASSWORD=
PROXY_DEDICATED_IP=proxy.example.com
PROXY_LOCATION=Germany
PROXY_SERVICE_TYPE=fresh
PROXY_SECURE=true
PROXY_SECURE_REJECT_UNAUTHORIZED=false
```

The tests execute in a predefined order (e.g., list, cd, pwd, upload, download,
rename, delete) using a test-runner.

## Contributing

Contributions are welcome! Please open issues or submit pull requests for bug
fixes, improvements, or new features. When contributing, please follow our
coding guidelines and include appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for details.
