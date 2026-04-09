export function fs_readFileSync(
  path: string,
  encoding?: BufferEncoding,
): string {
  return "";
}

export function fs_existsSync(path: string) {
  return false;
}

export function fs_unlinkSync(path: string) {}

export function fs_unlink(path: string, callback: (err: Error) => void) {
  callback(null);
}

export function fs_readDirectoryNames(path: string): string[] {
  return [];
}

export function fs_readdir(
  path: string,
  callback: (error: NodeJS.ErrnoException, files: string[]) => void,
) {
  callback(null, []);
}

export function fs_rimrafSync(path: string) {}
