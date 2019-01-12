import { URL } from "url";

export default function urlToPath(url: string): string {
    const path = new URL(url).pathname;
    if (process.platform === "win32") {
      return decodeURIComponent(path.substring(1, path.length));
    } else {
      return path;
    }
}