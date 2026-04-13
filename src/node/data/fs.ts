import fs from "fs";

export function fs_readFileSync(path: string, encoding?: BufferEncoding) {
  return fs.readFileSync(path, encoding);
}

export function fs_existsSync(path: string) {
  return fs.existsSync(path);
}
