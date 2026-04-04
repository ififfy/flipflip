import path from 'path'
export function path_join(...args: string[]) {
  return path.join(...args)
}
export function path_sep() {
  return path.sep;
}