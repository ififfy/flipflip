import {outputFile, move} from 'fs-extra';

export function fsExtra_outputFile(path: string, buffer: Buffer<ArrayBuffer>) {
  outputFile(path, buffer)
}

export function fsExtra_move(from: string, to: string, callback: (err: Error) => void) {
  move(from, to, callback)
}