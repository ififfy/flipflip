import getFolderSize from "get-folder-size";

export function folder_getFolderSize(path: string, callback: (err: string, size: number) => void) {
  return getFolderSize(path, callback)
}