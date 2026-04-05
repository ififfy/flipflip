export function fs_readFileSync(path: string, encoding?: BufferEncoding): string {
  return ''
}

export function fs_existsSync(path: string) {
  return true
}

export function fs_isDirectory(path: string) {
  return true
}

export function fs_unlinkSync(path: string) {
}

export function fs_unlink(path: string, callback: (err: Error) => void) {
  callback(null)
}

export function fs_containsFiles(path: string) {
  return true
}

export function fs_readDirectoryNames(path: string): string[] {
  return []
}

export function fs_writeFileSync(path: string, text: string) {

}

export function fs_unlinkBackups(backups: Array<{url: string, size: number}>) {
}

export function fs_mkdirSync(path: string) {

}

export function fs_fileSize(path: string) {
  return 0
}

export function fs_readdir(path: string, callback: (error: NodeJS.ErrnoException, files: string[]) => void) {
  callback(null, [])
}

export function fs_copyFileSync(src: string, dest: string) {
}

export function fs_renameSync(src: string, dest: string) {
}

export function fs_writeFile(path: string, data: string, callback: (err: Error) => void) {
  callback(null)
}

export function fs_recursiveReaddir(url: string, blacklist: string[], callback: (err: any, rawFiles: Array<string>) => void) {
  callback(null, [])
}