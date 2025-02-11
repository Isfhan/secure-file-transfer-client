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
export declare function resolveRemotePath(basePath: string, currentDir: string, remotePath: string): string;
/**
 * Normalizes a directory path ensuring it ends with a slash.
 *
 * @param path - The directory path to normalize.
 * @returns The normalized directory path.
 */
export declare function normalizeDir(path: string): string;
