import { move } from "fs-extra";

export function fsExtra_move(
  from: string,
  to: string,
  callback: (err: Error) => void,
) {
  move(from, to, callback);
}
