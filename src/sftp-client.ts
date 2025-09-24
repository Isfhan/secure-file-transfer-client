// Import stuff from ssh2-sftp-client
import SftpClientLib from 'ssh2-sftp-client';

// Import stuff from socks
import { SocksClient, SocksClientOptions } from 'socks';

// Import stuff from node
import { once } from 'events';
import tls, { TLSSocket } from 'tls';
import net, { Socket } from 'net';

// Import stuff from utils
import {
    resolveRemotePath,
    normalizeDir,
    mapSFTPFileInfo,
} from './utils/index.js';

// Import types
import {
    ConnectOptionsWithProxy,
    IFileTransferClient,
    ItemInfo,
} from './types/index.js';
import type { FileInfo } from 'ssh2-sftp-client';

export class SFTPClient implements IFileTransferClient {
    // Private properties
    private client: SftpClientLib;
    private basePath: string;
    private currentDir: string;
    private proxySocket: Socket | TLSSocket | undefined;

    /**
     * Creates a new instance of the SFTPClient.
     *
     * @param rootPath - The root directory that will be used as the base for all operations.
     * For example: "/var/www/vhosts/yourdomain.com/ftp/"
     */
    constructor(rootPath: string) {
        this.client = new SftpClientLib();
        this.basePath = normalizeDir(rootPath);
        this.currentDir = normalizeDir(rootPath);
    }

    /**
     * Connects to the SFTP server using the provided options.
     * Supports:
     * - socks4 / socks5 / http / https plain TCP proxies
     * - TLS-wrapped proxies (set proxy.secure = true) where we first TLS connect to proxy then do the socks negotiation over the TLS socket.
     *
     * @param options - The options to use to connect to the SFTP server.
     * @returns A promise that resolves when the connection is established.
     * @throws {Error} If connecting to the SFTP server fails.
     */
    async connect(options: ConnectOptionsWithProxy): Promise<void> {
        try {
            // Get the options
            const opt: ConnectOptionsWithProxy = options ?? {};

            // If proxy is provided and enabled
            if (opt.proxy && opt.proxy.enabled) {
                // Get the proxy
                const proxy = opt.proxy;

                // Get the proxy type
                const proxyType = proxy.type.toLowerCase();

                // Get the destination host and port
                const destinationHost = String(opt.host);
                const destinationPort = opt.port ? Number(opt.port) : 22;

                // HTTP/HTTPS CONNECT tunneling support
                if (proxyType === 'http' || proxyType === 'https') {
                    // Get the proxy host and port
                    const proxyHost = String(proxy.host);
                    const proxyPort = Number(proxy.port);

                    // Establish socket to proxy: TLS for https, plain for http
                    const proxySocket: Socket | TLSSocket =
                        proxyType === 'https'
                            ? tls.connect({
                                  host: proxyHost,
                                  port: proxyPort,
                                  rejectUnauthorized:
                                      proxy.secureRejectUnauthorized !==
                                      undefined
                                          ? Boolean(
                                                proxy.secureRejectUnauthorized
                                            )
                                          : false,
                              })
                            : net.connect({ host: proxyHost, port: proxyPort });

                    // Wait for connect/secureConnect
                    if (proxyType === 'https') {
                        // Wait for secureConnect
                        await once(proxySocket, 'secureConnect');
                    } else {
                        // Wait for connect
                        await once(proxySocket, 'connect');
                    }

                    // Auth header
                    const authHeader =
                        proxy.username && proxy.password
                            ? `Proxy-Authorization: Basic ${Buffer.from(
                                  `${proxy.username}:${proxy.password}`
                              ).toString('base64')}`
                            : '';

                    // Connect request
                    const connectReq =
                        `CONNECT ${destinationHost}:${destinationPort} HTTP/1.1\r\n` +
                        `Host: ${destinationHost}:${destinationPort}\r\n` +
                        (authHeader ? authHeader + `\r\n` : '') +
                        `Connection: keep-alive\r\n` +
                        `\r\n`;

                    // Write connect request
                    proxySocket.write(connectReq);

                    // Read response headers
                    const response: Buffer[] = [];

                    // Total length
                    let total = 0;

                    // Header end
                    const headerEnd = Buffer.from('\r\n\r\n');

                    // Read headers
                    const readHeaders = async () => {
                        // Return promise
                        return await new Promise<Buffer>((resolve, reject) => {
                            // On data
                            const onData = (chunk: Buffer) => {
                                // Push chunk
                                response.push(chunk);

                                // Total length
                                total += chunk.length;

                                // Buffer
                                const buf = Buffer.concat(response, total);

                                // Index of header end
                                const idx = buf.indexOf(headerEnd);

                                // If index is not -1
                                if (idx !== -1) {
                                    // Cleanup
                                    cleanup();

                                    // Resolve
                                    resolve(buf.subarray(0, idx + 4));
                                }
                            };

                            // On error
                            const onError = (err: any) => {
                                // Cleanup
                                cleanup();

                                // Reject
                                reject(err);
                            };

                            // On close
                            const onClose = () => {
                                // Cleanup
                                cleanup();

                                // Reject
                                reject(
                                    new Error(
                                        'Proxy socket closed before CONNECT response'
                                    )
                                );
                            };

                            // Cleanup
                            const cleanup = () => {
                                // Off data
                                proxySocket.off('data', onData);
                                proxySocket.off('error', onError);
                                proxySocket.off('close', onClose);
                            };

                            // On data
                            proxySocket.on('data', onData);
                            proxySocket.on('error', onError);
                            proxySocket.on('close', onClose);
                        });
                    };

                    // Header buffer
                    const headerBuf = await readHeaders();

                    // Header string
                    const headerStr = headerBuf.toString('utf8');

                    // Simple status check: must be 200
                    const firstLine = headerStr.split(/\r?\n/)[0];

                    if (!/^HTTP\/\d\.\d\s+200\s/i.test(firstLine)) {
                        try {
                            // Destroy socket
                            proxySocket.destroy();
                            // Swallow error
                        } catch (_) {}

                        // Throw error
                        throw new Error(
                            `SFTPClient: HTTP CONNECT failed via proxy ${proxyHost}:${proxyPort} -> ${firstLine}`
                        );
                    }

                    // Tunnel established; use this socket with ssh2-sftp-client
                    this.proxySocket = proxySocket;

                    // Build connect options
                    const connectOpts: { [key: string]: any } = {
                        sock: proxySocket,
                    };

                    const authKeys = [
                        'username',
                        'password',
                        'privateKey',
                        'passphrase',
                        'agent',
                        'readyTimeout',
                        'keepaliveInterval',
                        'keepaliveCountMax',
                    ];

                    for (const k of authKeys) {
                        if ((opt as any)[k] !== undefined)
                            connectOpts[k] = (opt as any)[k];
                    }

                    for (const k of Object.keys(opt)) {
                        if (k === 'host' || k === 'port' || k === 'proxy')
                            continue;
                        if (connectOpts[k] === undefined)
                            connectOpts[k] = (opt as any)[k];
                    }

                    // Connect to the server
                    await this.client.connect(connectOpts);
                    return;
                }

                // SOCKS4/5 (optionally TLS-wrapped) support
                if (proxyType !== 'socks5' && proxyType !== 'socks4') {
                    // Throw error
                    throw new Error(
                        `SFTPClient: Unsupported proxy.type '${proxy.type}'. Supported: socks5, socks4, http, https.`
                    );
                }

                // Build socks options (we will add TLS-wrapped flow if proxy.secure === true)
                if (proxy.secure) {
                    // Build TLS options
                    // TLS-wrapped proxy (connect TLS to proxy host:port first)
                    const tlsOpts = {
                        host: String(proxy.host),
                        port: Number(proxy.port),
                        rejectUnauthorized:
                            proxy.secureRejectUnauthorized !== undefined
                                ? Boolean(proxy.secureRejectUnauthorized)
                                : false,
                    };

                    // Create TLS socket to the proxy (this socket is connected to the proxy)
                    const tlsSocket = tls.connect(tlsOpts);

                    // Wait for secure connect
                    await once(tlsSocket, 'secureConnect');

                    // Now ask socks to create a connection using the existing socket
                    // The 'socks' library supports passing an existing socket using
                    // either `existing_socket` (varies across versions),
                    // so we pass both names in the options object.
                    const socksOpts: SocksClientOptions = {
                        existing_socket: tlsSocket,
                        proxy: {
                            host: proxy.host,
                            port: Number(proxy.port),
                            type: proxyType === 'socks5' ? 5 : 4,
                            userId: proxy.username,
                            password: proxy.password,
                        },
                        command: 'connect',
                        destination: {
                            host: String(destinationHost),
                            port: Number(destinationPort),
                        },
                        timeout: 20000,
                    };

                    // Create connection
                    const info = await SocksClient.createConnection(
                        socksOpts as any
                    );

                    // Get the socket
                    const socket = (info as any).socket;

                    // Throw error if socket is not returned
                    if (!socket)
                        throw new Error(
                            'SFTPClient: socks.createConnection did not return socket (TLS path)'
                        );

                    this.proxySocket = socket;

                    // Build connect options
                    const connectOpts: { [key: string]: any } = {
                        sock: socket,
                    };

                    const authKeys = [
                        'username',
                        'password',
                        'privateKey',
                        'passphrase',
                        'agent',
                        'readyTimeout',
                        'keepaliveInterval',
                        'keepaliveCountMax',
                    ];

                    for (const k of authKeys) {
                        if ((opt as any)[k] !== undefined)
                            connectOpts[k] = (opt as any)[k];
                    }

                    for (const k of Object.keys(opt)) {
                        if (k === 'host' || k === 'port' || k === 'proxy')
                            continue;
                        if (connectOpts[k] === undefined)
                            connectOpts[k] = (opt as any)[k];
                    }

                    await this.client.connect(connectOpts);
                    return;
                } else {
                    // Plain SOCKS connection (no TLS handshake to proxy)
                    const socksOpts: SocksClientOptions = {
                        proxy: {
                            host: proxy.host,
                            port: Number(proxy.port),
                            type: proxyType === 'socks5' ? 5 : 4,
                            userId: proxy.username,
                            password: proxy.password,
                        },
                        command: 'connect',
                        destination: {
                            host: String(destinationHost),
                            port: destinationPort,
                        },
                        timeout: 20000,
                    };

                    const info = await SocksClient.createConnection(
                        socksOpts as any
                    );

                    const socket = (info as any).socket;

                    if (!socket)
                        throw new Error(
                            'SFTPClient: socks.createConnection did not return socket'
                        );

                    this.proxySocket = socket;

                    // Build connect options for ssh2-sftp-client
                    const connectOpts: { [key: string]: any } = {
                        sock: socket,
                    };

                    const authKeys = [
                        'username',
                        'password',
                        'privateKey',
                        'passphrase',
                        'agent',
                        'readyTimeout',
                        'keepaliveInterval',
                        'keepaliveCountMax',
                    ];

                    for (const k of authKeys) {
                        if ((opt as any)[k] !== undefined)
                            connectOpts[k] = (opt as any)[k];
                    }

                    for (const k of Object.keys(opt)) {
                        if (k === 'host' || k === 'port' || k === 'proxy')
                            continue;
                        if (connectOpts[k] === undefined)
                            connectOpts[k] = (opt as any)[k];
                    }

                    await this.client.connect(connectOpts);
                    return;
                }
            }

            // No proxy: default behavior
            await this.client.connect(options);
            return;
        } catch (error: any) {
            // Cleanup socket if we created one
            try {
                if (this.proxySocket) {
                    // socket.destroy may exist, close otherwise
                    this.proxySocket.destroy();
                    this.proxySocket = undefined;
                }
            } catch (_) {
                // Swallow
            }

            // Log error
            console.error(
                'SFTPClient: Error connecting to SFTP server:',
                error
            );

            // Throw error
            throw new Error('SFTPClient: Connection failed: ' + error.message);
        }
    }

    /**
     * Lists the files and directories in the specified remote directory.
     * If no directory is provided, lists the current working directory.
     *
     * @param remoteDir - Optional remote directory (relative or absolute).
     * @returns A promise that resolves with an array of FileInfo objects.
     * @throws {Error} If listing the directory fails.
     */
    async list(remoteDir?: string): Promise<ItemInfo[]> {
        try {
            const dirToResolve = remoteDir ?? '';
            const path = resolveRemotePath(
                this.basePath,
                this.currentDir,
                dirToResolve
            );
            const rawList: FileInfo[] = await this.client.list(path);
            return rawList.map(mapSFTPFileInfo);
        } catch (error: any) {
            console.error('SFTPClient: Error listing directory:', error);
            throw new Error('SFTPClient: List failed: ' + error.message);
        }
    }

    /**
     * Changes the current working directory on the remote server.
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
    async cd(remoteDir: string): Promise<void> {
        try {
            let newDir: string;
            if (remoteDir.startsWith('/')) {
                newDir = resolveRemotePath(
                    this.basePath,
                    this.basePath,
                    remoteDir
                );
            } else {
                newDir = resolveRemotePath(
                    this.basePath,
                    this.currentDir,
                    remoteDir
                );
            }
            this.currentDir = newDir;
            console.log(
                `SFTPClient: current directory set to ${this.currentDir}`
            );
        } catch (error: any) {
            console.error('SFTPClient: Error changing directory:', error);
            throw new Error('SFTPClient: cd failed: ' + error.message);
        }
    }

    /**
     * Retrieves the current working directory from the remote server.
     *
     * @returns The current directory path.
     * @throws {Error} If retrieving the current directory fails.
     */
    async pwd(): Promise<string> {
        try {
            return Promise.resolve(this.currentDir);
        } catch (error: any) {
            console.error(
                'SFTPClient: Error retrieving current directory:',
                error
            );
            throw new Error('SFTPClient: pwd failed: ' + error.message);
        }
    }

    /**
     * Downloads a file from the remote server to the local filesystem.
     *
     * @param remoteFile The path to the file on the remote server. This is relative to the root path specified in the constructor.
     * @param localFile The path where the file will be saved locally.
     * @returns A promise that resolves when the download is complete.
     * @throws {Error} If downloading the file fails.
     */
    async downloadFile(remoteFile: string, localFile: string): Promise<void> {
        try {
            const path = resolveRemotePath(
                this.basePath,
                this.currentDir,
                remoteFile
            );
            await this.client.get(path, localFile);
        } catch (error: any) {
            console.error('SFTPClient: Error downloading file:', error);
            throw new Error('SFTPClient: Download failed: ' + error.message);
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
    async uploadFile(localFile: string, remoteFile: string): Promise<void> {
        try {
            const path = resolveRemotePath(
                this.basePath,
                this.currentDir,
                remoteFile
            );
            await this.client.put(localFile, path);
        } catch (error: any) {
            console.error('SFTPClient: Error uploading file:', error);
            throw new Error('SFTPClient: Upload failed: ' + error.message);
        }
    }

    /**
     * Deletes a file from the remote server.
     *
     * @param remoteFile The path to the file on the remote server. This is relative to the root path specified in the constructor.
     * @returns A promise that resolves when the deletion is complete.
     * @throws {Error} If deleting the file fails.
     */
    async deleteFile(remoteFile: string): Promise<void> {
        try {
            const path = resolveRemotePath(
                this.basePath,
                this.currentDir,
                remoteFile
            );
            await this.client.delete(path);
        } catch (error: any) {
            console.error('SFTPClient: Error deleting file:', error);
            throw new Error('SFTPClient: Delete failed: ' + error.message);
        }
    }

    /**
     * Renames a file on the SFTP server.
     * Both old and new file paths are resolved against the current directory.
     *
     * @param {string} oldPath - The current path of the file.
     * @param {string} newPath - The new path for the file.
     * @returns {Promise<void>} A promise that resolves when the rename operation is complete.
     * @throws {Error} If renaming the file fails.
     */
    async renameFile(oldPath: string, newPath: string): Promise<void> {
        try {
            const resolvedOld = resolveRemotePath(
                this.basePath,
                this.currentDir,
                oldPath
            );
            const resolvedNew = resolveRemotePath(
                this.basePath,
                this.currentDir,
                newPath
            );
            await this.client.rename(resolvedOld, resolvedNew);
        } catch (error: any) {
            console.error('SFTPClient: Error renaming file:', error);
            throw new Error('SFTPClient: Rename failed: ' + error.message);
        }
    }

    /**
     * Disconnects from the SFTP server.
     *
     * @returns A promise that resolves when the connection is closed.
     * @throws {Error} If disconnecting from the server fails.
     */
    async disconnect(): Promise<void> {
        try {
            await this.client.end();
        } catch (error: any) {
            console.error('SFTPClient: Error disconnecting:', error);
            throw new Error('SFTPClient: Disconnect failed: ' + error.message);
        } finally {
            // destroy the proxy socket if present
            try {
                if (this.proxySocket) {
                    (this.proxySocket as Socket).destroy?.();
                    this.proxySocket = undefined;
                }
            } catch (e) {
                // swallow cleanup errors
            }
        }
    }
}
