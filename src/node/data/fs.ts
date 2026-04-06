import fs from "fs";
import { rimraf } from "rimraf";

export function fs_readFileSync(path: string, encoding?: BufferEncoding) {
  return fs.readFileSync(path, encoding);
}

export function fs_existsSync(path: string) {
  return fs.existsSync(path);
}

export function fs_isDirectory(path: string) {
  return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
}

export function fs_unlinkSync(path: string) {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
}

export function fs_unlink(path: string, callback: (err: Error) => void) {
  if (fs.existsSync(path)) {
    fs.unlink(path, callback);
  }
}

export function fs_readDirectoryNames(path: string) {
  return fs
    .readdirSync(path, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

export function fs_writeFileSync(path: string, text: string) {
  fs.writeFileSync(path, text);
}

export function fs_mkdirSync(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

export function fs_readdir(
  path: string,
  callback: (error: NodeJS.ErrnoException, files: string[]) => void,
) {
  fs.readdir(path, callback);
}

export function fs_copyFileSync(src: string, dest: string) {
  fs.copyFileSync(src, dest);
}

export function fs_renameSync(src: string, dest: string) {
  fs.renameSync(src, dest);
}

export function fs_writeFile(
  path: string,
  data: string,
  callback: (err: Error) => void,
) {
  fs.writeFile(path, data, callback);
}

export function fs_rimrafSync(path: string) {
  rimraf.sync(path);
}
