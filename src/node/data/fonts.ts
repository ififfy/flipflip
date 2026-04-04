import fontList from "font-list";
import SystemFonts from "system-font-families";

export function fonts_getFonts() {
  if (process.platform == "darwin") {
    return new SystemFonts().getFonts();
  } else {
    return fontList.getFonts().then((res: Array<string>) => {
      return res.map((r) => {
        if (r.startsWith("\"") && r.endsWith("\"")) {
          return r.substring(1, r.length - 1);
        } else {
          return r;
        }
      })
    });
  }
}