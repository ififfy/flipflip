import {sep, join} from 'path';

export function pathname(p: string, all: Array<string>): string {
  const parts = p.split(sep).reverse();
  const allParts = all
    .filter((p2) => p2 != p)
    .map((p2) => p2.split(sep).reverse());

  let end = 0;
  let conflict = true;
  while (conflict && end < parts.length) {
    conflict = false;
    end += 1;
    const thisSubset = parts.slice(0, end).join(sep);

    for (let p2 of allParts) {
      if (p2.slice(0, end).join(sep) == thisSubset) {
        conflict = true;
      }
    }
  }

  const subset = parts.slice(0, end);
  return subset.reverse().join(sep);
}