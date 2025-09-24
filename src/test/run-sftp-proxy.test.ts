import dotenv from 'dotenv';
dotenv.config();

import { SecureFileTransferClient } from '../secure-file-transfer-client.js';
import { ConnectOptionsWithProxy } from '../types/index.js';

const cfg = {
    host: process.env.HOST as string,
    username: process.env.USER as string,
    password: process.env.PASSWORD as string,
    protocol: process.env.PROTOCOL as string,
    rootPath: process.env.ROOT_PATH as string,
    proxy: {
        enabled: process.env.PROXY_ENABLED === 'true',
        type: process.env.PROXY_TYPE as 'socks5' | 'socks4' | 'http' | 'https',
        host: process.env.PROXY_HOST as string,
        port: process.env.PROXY_PORT as string,
        username: process.env.PROXY_USERNAME as string,
        password: process.env.PROXY_PASSWORD as string,
        dedicated_ip: process.env.PROXY_DEDICATED_IP as string,
        location: process.env.PROXY_LOCATION as string,
        service_type: process.env.PROXY_SERVICE_TYPE as string,
        // HTTPS proxy uses TLS; leave verification off if proxy uses custom cert
        // secureRejectUnauthorized: false,
        // secure: true,
    },
};

console.log(cfg);

(async () => {
    const client = new SecureFileTransferClient('sftp', cfg.rootPath);
    // For ssh2-sftp-client the connect options expect `username` not `user`.
    await client.connect({
        host: cfg.host,
        port: 22,
        username: cfg.username,
        password: cfg.password,
        proxy: cfg.proxy, // <- our new proxy field
    } as ConnectOptionsWithProxy);

    const list = await client.list('/');
    console.log('Remote list:', list);

    await client.disconnect();
})();
