import { ST } from "./const";

export function removeDuplicatesBy(keyFn: Function, array: any[]): any[] {
  let mySet = new Set();
  return array.filter(function (x: any) {
    let key = keyFn(x);
    let isNew = !mySet.has(key);
    if (isNew) mySet.add(key);
    return isNew;
  });
}

export function isText(path: string, strict: boolean): boolean {
  if (path == null) return false;
  const p = path.toLowerCase();
  const acceptableExtensions = [".txt"];
  for (let ext of acceptableExtensions) {
    if (strict) {
      if (p.endsWith(ext)) return true;
    } else {
      if (p.includes(ext)) return true;
    }
  }
  return false;
}

export const isImageOrVideo = (path: string, strict: boolean): boolean => {
  return isImage(path, strict) || isVideo(path, strict);
};

export function isImage(path: string, strict: boolean): boolean {
  if (path == null) return false;
  const p = path.toLowerCase();
  const acceptableExtensions = [
    ".gif",
    ".png",
    ".jpeg",
    ".jpg",
    ".webp",
    ".tiff",
    ".svg",
  ];
  for (let ext of acceptableExtensions) {
    if (strict) {
      if (p.endsWith(ext)) return true;
    } else {
      if (p.includes(ext)) return true;
    }
  }
  return false;
}

export function isVideo(path: string, strict: boolean): boolean {
  if (path == null) return false;
  const p = path.toLowerCase();
  const acceptableExtensions = [
    ".mp4",
    ".mkv",
    ".webm",
    ".ogv",
    ".mov",
    ".m4v",
  ];
  for (let ext of acceptableExtensions) {
    if (strict) {
      if (p.endsWith(ext)) return true;
    } else {
      if (p.includes(ext)) return true;
    }
  }
  return false;
}

export function isVideoPlaylist(path: string, strict: boolean): boolean {
  if (path == null) return false;
  const p = path.toLowerCase();
  const acceptableExtensions = [".asx", ".m3u8", ".pls", ".xspf"];
  for (let ext of acceptableExtensions) {
    if (strict) {
      if (p.endsWith(ext)) return true;
    } else {
      if (p.includes(ext)) return true;
    }
  }
  return false;
}

export function isAudio(path: string, strict: boolean): boolean {
  if (path == null) return false;
  const p = path.toLowerCase();
  const acceptableExtensions = [".mp3", ".m4a", ".wav", ".ogg"];
  for (let ext of acceptableExtensions) {
    if (strict) {
      if (p.endsWith(ext)) return true;
    } else {
      if (p.includes(ext)) return true;
    }
  }
  return false;
}

export function getFileName(url: string, pathSep: string, extension = true) {
  let sep;
  if (/^(https?:\/\/)|(file:\/\/)/g.exec(url) != null) {
    sep = "/";
  } else {
    sep = pathSep;
  }
  url = url.substring(url.lastIndexOf(sep) + 1);
  if (url.includes("?")) {
    url = url.substring(0, url.indexOf("?"));
  }
  if (!extension) {
    url = url.substring(0, url.lastIndexOf("."));
  }
  return url;
}

export function getSourceType(url: string): string {
  if (isAudio(url, false)) {
    return ST.audio;
  } else if (isVideo(url, false)) {
    return ST.video;
  } else if (isVideoPlaylist(url, true)) {
    return ST.playlist;
  } else if (/^https?:\/\/([^.]*|(66\.media))\.tumblr\.com/.exec(url) != null) {
    return ST.tumblr;
  } else if (/^https?:\/\/(www\.)?reddit\.com\//.exec(url) != null) {
    return ST.reddit;
  } else if (/^https?:\/\/(www\.)?redgifs\.com\//.exec(url) != null) {
    return ST.redgifs;
  } else if (/^https?:\/\/(www\.)?imagefap\.com\//.exec(url) != null) {
    return ST.imagefap;
  } else if (/^https?:\/\/(www\.)?imgur\.com\//.exec(url) != null) {
    return ST.imgur;
  } else if (/^https?:\/\/(www\.)?(cdn\.)?sex\.com\//.exec(url) != null) {
    return ST.sexcom;
  } else if (/^https?:\/\/(www\.)?deviantart\.com\//.exec(url) != null) {
    return ST.deviantart;
  } else if (
    /^https?:\/\/(www\.)?(lolibooru\.moe|hypnohub\.net|danbooru\.donmai\.us)\//.exec(
      url,
    ) != null
  ) {
    return ST.danbooru;
  } else if (
    /^https?:\/\/(www\.)?(gelbooru\.com|furry\.booru\.org|rule34\.xxx|realbooru\.com|safebooru\.org)\//.exec(
      url,
    ) != null
  ) {
    return ST.gelbooru2;
  } else if (/^https?:\/\/(www\.)?(e621\.net)\//.exec(url) != null) {
    return ST.e621;
  } else if (
    /^https?:\/\/(www\.|members\.)?luscious\.net\//.exec(url) != null
  ) {
    return ST.luscious;
  } else if (
    /^https?:\/\/(www\.)?(.*\.booru\.org|idol\.sankakucomplex\.com)\//.exec(
      url,
    ) != null
  ) {
    return ST.gelbooru1;
  } else if (/^https?:\/\/(www\.)?e-hentai\.org\/g\//.exec(url) != null) {
    return ST.ehentai;
  } else if (/^https?:\/\/[^.]*\.bdsmlr\.com/.exec(url) != null) {
    return ST.bdsmlr;
  } else if (
    /^https?:\/\/[\w\\.]+:\d+\/get_files\/search_files/.exec(url) != null
  ) {
    return ST.hydrus;
  } else if (/^https?:\/\/[^.]*\.[a-z0-9\.:]+\/ws.php/.exec(url) != null) {
    return ST.piwigo;
  } else if (/^https?:\/\/hypno\.nimja\.com\/visual\/\d+/.exec(url) != null) {
    return ST.nimja;
  } else if (/(^https?:\/\/)|(\.txt$)/.exec(url) != null) {
    // Arbitrary URL, assume image list
    return ST.list;
  } else {
    // Directory
    return ST.local;
  }
}

export function getFileGroup(url: string, pathSep: string) {
  let sep;
  switch (getSourceType(url)) {
    case ST.tumblr:
      let tumblrID = url.replace(/https?:\/\//, "");
      tumblrID = tumblrID.replace(/\.tumblr\.com\/?/, "");
      return tumblrID;
    case ST.reddit:
      let redditID = url;
      if (redditID.endsWith("/"))
        redditID = redditID.slice(0, url.lastIndexOf("/"));
      if (redditID.endsWith("/saved"))
        redditID = redditID.replace("/saved", "");
      redditID = redditID.substring(redditID.lastIndexOf("/") + 1);
      return redditID;
    case ST.redgifs:
      let redgifID;
      if (url.includes("/browse?")) {
        let redgifRegex =
          /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*tags=([^&]*)/.exec(
            url,
          );
        return redgifRegex.length ? redgifRegex[1] : "all";
      } else if (url.includes("/users/")) {
        redgifID = url.replace(/^https?:\/\/(www\.)?redgifs\.com\/users\//, "");
        if (redgifID.includes("/")) {
          redgifID = redgifID.substring(0, redgifID.indexOf("/"));
        }
      }
      return redgifID;
    case ST.imagefap:
      let imagefapID = url.replace(/https?:\/\/www\.imagefap\.com\//, "");
      imagefapID = imagefapID.replace(/pictures\//, "");
      imagefapID = imagefapID.replace(/gallery\//, "");
      imagefapID = imagefapID.replace(/organizer\//, "");
      imagefapID = imagefapID.replace(/video\.php\?vid=/, "");
      imagefapID = imagefapID.split("/")[0];
      return imagefapID;
    case ST.sexcom:
      let sexcomID = url.replace(/https?:\/\/www\.sex\.com\//, "");
      sexcomID = sexcomID.replace(/user\//, "");
      sexcomID = sexcomID.split("?")[0];
      if (sexcomID.endsWith("/")) {
        sexcomID = sexcomID.substring(0, sexcomID.length - 1);
      }
      return sexcomID;
    case ST.imgur:
      let imgurID = url.replace(/https?:\/\/imgur\.com\//, "");
      imgurID = imgurID.replace(/a\//, "");
      return imgurID;
    case ST.deviantart:
      let authorID = url.replace(/https?:\/\/www\.deviantart\.com\//, "");
      if (authorID.includes("/")) {
        authorID = authorID.substring(0, authorID.indexOf("/"));
      }
      return authorID;
    case ST.e621:
      const hostRegexE621 = /^https?:\/\/(?:www\.)?([^.]*)\./g;
      const hostE621 = hostRegexE621.exec(url)[1];
      let E621ID = "";
      if (url.includes("/pools/")) {
        E621ID = "pool" + url.substring(url.lastIndexOf("/"));
      } else {
        const tagRegex = /[?&]tags=(.*)&?/g;
        let tags;
        if ((tags = tagRegex.exec(url)) !== null) {
          E621ID = tags[1];
        }
        if (E621ID.endsWith("+")) {
          E621ID = E621ID.substring(0, E621ID.length - 1);
        }
      }
      return hostE621 + "/" + decodeURIComponent(E621ID);
    case ST.luscious:
      let albumID = url.replace(
        /^https?:\/\/(www\.|members\.)?luscious\.net\/(albums|users)\//,
        "",
      );
      if (albumID.includes("/")) {
        albumID = albumID.substring(0, albumID.indexOf("/"));
      }
      return albumID;
    case ST.danbooru:
    case ST.gelbooru1:
    case ST.gelbooru2:
      const hostRegex = /^https?:\/\/(?:www\.)?([^.]*)\./g;
      const host = hostRegex.exec(url)[1];
      let danbooruID = "";
      if (url.includes("/pools/")) {
        danbooruID = "pools/" + url.substring(url.lastIndexOf("/"));
      } else if (url.includes("/favorite_groups/")) {
        danbooruID = "favorite_groups/" + url.substring(url.lastIndexOf("/"));
      } else {
        const tagRegex = /[?&]tags=(.*)&?/g;
        let tags;
        if ((tags = tagRegex.exec(url)) !== null) {
          danbooruID = tags[1];
        }
        const titleRegex = /[?&]title=(.*)&?/g;
        let title;
        if ((title = titleRegex.exec(url)) !== null) {
          if (tags == null) {
            danbooruID = "";
          } else if (!danbooruID.endsWith("+")) {
            danbooruID += "+";
          }
          danbooruID += title[1];
        }
        if (danbooruID.endsWith("+")) {
          danbooruID = danbooruID.substring(0, danbooruID.length - 1);
        }
      }
      return host + "/" + decodeURIComponent(danbooruID);
    case ST.ehentai:
      const galleryRegex = /^https?:\/\/(?:www\.)?e-hentai\.org\/g\/([^\/]*)/g;
      const gallery = galleryRegex.exec(url);
      return gallery[1];
    case ST.list:
      if (/^https?:\/\//g.exec(url) != null) {
        sep = "/";
      } else {
        sep = pathSep;
      }
      return url.substring(url.lastIndexOf(sep) + 1).replace(".txt", "");
    case ST.local:
      if (url.endsWith(pathSep)) {
        url = url.substring(0, url.length - 1);
        return url.substring(url.lastIndexOf(pathSep) + 1);
      } else {
        return url.substring(url.lastIndexOf(pathSep) + 1);
      }
    case ST.video:
    case ST.playlist:
    case ST.nimja:
      if (/^https?:\/\//g.exec(url) != null) {
        sep = "/";
      } else {
        sep = pathSep;
      }
      let name = url.substring(0, url.lastIndexOf(sep));
      return name.substring(name.lastIndexOf(sep) + 1);
    case ST.bdsmlr:
      let bdsmlrID = url.replace(/https?:\/\//, "");
      bdsmlrID = bdsmlrID.replace(/\/rss/, "");
      bdsmlrID = bdsmlrID.replace(/\.bdsmlr\.com\/?/, "");
      return bdsmlrID;
    case ST.hydrus:
      const tagsRegex = /tags=([^&]*)&?.*$/.exec(url);
      if (tagsRegex == null) return "hydrus";
      let tags = tagsRegex[1];
      if (!tags.startsWith("[")) {
        tags = decodeURIComponent(tags);
      }
      tags = tags.substring(1, tags.length - 1);
      tags = tags.replace(/"/g, "");
      return tags;
    case ST.piwigo:
      const catRegex = /cat_id\[]=(\d*)/.exec(url);
      if (catRegex != null) return catRegex[1];

      const tagRegex = /tag_id\[]=(\d*)/.exec(url);
      if (tagRegex != null) return tagRegex[1];

      return "piwigo";
  }
}

export function urlToPath(url: string, platform: string): string {
  const path = new URL(url).pathname;
  if (platform === "win32") {
    return decodeURIComponent(path.substring(1, path.length));
  } else {
    return decodeURIComponent(path);
  }
}
