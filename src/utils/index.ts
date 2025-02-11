// Import stuff from path
import { posix } from 'path';

// Import types
import type { FileInfo as FTPFileInfo } from 'basic-ftp';
import type { FileInfo as SFTPFileInfo } from 'ssh2-sftp-client';
import type { ItemInfo, NormalizedType } from '../types/index.d.ts';

/**
 * Resolves a given remote path against the basePath and the currentDir.
 * - If the remotePath is absolute (i.e. starts with '/'), the function removes the leading slash
 *   and joins it with the basePath.
 * - If remotePath is relative, it is joined with the currentDir.
 *
 * @param basePath - The fixed root path (e.g. process.env.ROOT_PATH).
 * @param currentDir - The current working directory.
 * @param remotePath - The remote path provided by the user.
 * @returns The fully resolved remote path.
 */
export function resolveRemotePath(
    basePath: string,
    currentDir: string,
    remotePath: string
): string {
    if (remotePath.startsWith('/')) {
        // Remove the leading slash and join with the basePath.
        return posix.join(basePath, remotePath.slice(1));
    }
    return posix.join(currentDir, remotePath);
}

/**
 * Normalizes a directory path ensuring it ends with a slash.
 *
 * @param path - The directory path to normalize.
 * @returns The normalized directory path.
 */
export function normalizeDir(path: string): string {
    return path.endsWith('/') ? path : path + '/';
}

/**
 * Converts a file type number/string from basic-ftp/ssh2-sftp-client
 * into a normalized type string ('file', 'directory', 'symlink', or
 * 'unknown') with isDirectory and isFile properties.
 */
function normalizeFileType(type: number | string): NormalizedType {
    if (type === 2 || type === 'd') {
        return { type: 'directory', isDirectory: true, isFile: false };
    } else if (type === 1 || type === '-') {
        return { type: 'file', isDirectory: false, isFile: true };
    } else if (type === 'l') {
        return { type: 'symlink', isDirectory: false, isFile: false };
    } else {
        return { type: 'unknown', isDirectory: false, isFile: false };
    }
}

/**
 * Maps a FileInfo object from basic-ftp into an ItemInfo object.
 *
 * @param info - The FileInfo object from basic-ftp.
 * @returns An ItemInfo object with the converted properties.
 */
export function mapFTPFileInfo(info: FTPFileInfo): ItemInfo {
    const norm = normalizeFileType(info.type);
    return {
        name: info.name,
        type: norm.type,
        size: info.size,
        modifiedAt: info.modifiedAt ? new Date(info.modifiedAt) : undefined,
        owner: info.user,
        group: info.group,
        permissions: info.permissions
            ? {
                  user: info.permissions.user,
                  group: info.permissions.group,
                  other: info.permissions.world,
              }
            : undefined,
        isDirectory: norm.isDirectory,
        isFile: norm.isFile,
    };
}

/**
 * Maps a FileInfo object from ssh2-sftp-client into an ItemInfo object.
 *
 * @param info - The FileInfo object from ssh2-sftp-client.
 * @returns An ItemInfo object with the converted properties.
 */
export function mapSFTPFileInfo(info: SFTPFileInfo): ItemInfo {
    const norm = normalizeFileType(info.type);
    return {
        name: info.name,
        type: norm.type,
        size: info.size,
        modifiedAt: new Date(info.modifyTime),
        owner: info.owner,
        group: info.group,
        permissions: info.rights
            ? {
                  user: info.rights.user,
                  group: info.rights.group,
                  other: info.rights.other,
              }
            : undefined,
        isDirectory: norm.isDirectory,
        isFile: norm.isFile,
    };
}
