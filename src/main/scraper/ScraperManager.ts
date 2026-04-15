import fs from "fs";
import path from "path";
import wretch from "wretch";
import fileUrl from "file-url";
import recursiveReaddir from "recursive-readdir";
import Config from "../../common/Config";
import LibrarySource from "../../common/LibrarySource";
import { IF, ST } from "../../common/const";
import { urlToPath } from "../../common/utils";
import {
  filterPathsToJustPlayable,
  loadBDSMlr,
  loadDanbooru,
  loadDeviantArt,
  loadE621,
  loadEHentai,
  loadGelbooru1,
  loadGelbooru2,
  loadHydrus,
  loadImageFap,
  loadImgur,
  loadLuscious,
  loadPiwigo,
  loadReddit,
  loadRedGifs,
  loadRemoteImageURLList,
  loadSexCom,
  loadTumblr,
  processAllURLs,
} from "./Scrapers";
import { getFileName, getSourceType, isVideo } from "../../common/utils";

const loadNimja = (
  pm: Function,
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  cachePath: string,
) => {
  let sources = [source.url];
  allURLs = processAllURLs(sources, allURLs, source, weight, helpers);
  helpers.next = null;
  pm({
    data: sources,
    allURLs: allURLs,
    allPosts: allPosts,
    weight: weight,
    helpers: helpers,
    source: source,
    timeout: 0,
  });
};

const loadLocalDirectory = (
  pm: Function,
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  cachePath: string,
) => {
  const blacklist = ["*.css", "*.html", "avatar.png", "*.txt"];
  const url = cachePath ? cachePath : source.url;

  recursiveReaddir(url, blacklist, (err: any, rawFiles: Array<string>) => {
    if (err) {
      pm({
        error: err.message,
        helpers: helpers,
        source: source,
        timeout: 0,
      });
    } else {
      const collator = new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: "base",
      });
      let sources = filterPathsToJustPlayable(filter, rawFiles, true)
        .map((p) => fileUrl(p))
        .sort(collator.compare);

      if (source.blacklist && source.blacklist.length > 0) {
        sources = sources.filter(
          (url: string) =>
            !source.blacklist.includes(url) &&
            !source.blacklist.includes(urlToPath(url, process.platform)),
        );
      }
      allURLs = processAllURLs(sources, allURLs, source, weight, helpers);
      // If this is a local source (not a cacheDir call)
      if (helpers.next == -1) {
        helpers.count = filterPathsToJustPlayable(
          IF.any,
          rawFiles,
          true,
        ).length;
        helpers.next = null;
      }

      pm({
        data: sources,
        allURLs: allURLs,
        allPosts: allPosts,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: 0,
      });
    }
  });
};

const loadVideo = (
  pm: Function,
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  cachePath: string,
) => {
  const url = cachePath ? cachePath : source.url;
  const missingVideo = () => {
    pm({
      error: "Could not find " + source.url,
      data: [],
      allURLs: allURLs,
      allPosts: allPosts,
      weight: weight,
      helpers: helpers,
      source: source,
      timeout: 0,
    });
  };
  const ifExists = (url: string) => {
    if (!url.startsWith("http")) {
      url = fileUrl(url);
    }
    helpers.count = 1;

    let paths;
    if (source.clips && source.clips.length > 0) {
      const clipPaths = Array<string>();
      for (let clip of source.clips) {
        if (!source.disabledClips || !source.disabledClips.includes(clip.id)) {
          let clipPath =
            url +
            ":::" +
            clip.id +
            ":" +
            (clip.volume != null ? clip.volume : "-") +
            ":::" +
            clip.start +
            ":" +
            clip.end;
          if (source.subtitleFile != null && source.subtitleFile.length > 0) {
            clipPath = clipPath + "|||" + source.subtitleFile;
          }
          clipPaths.push(clipPath);
        }
      }
      paths = clipPaths;
    } else {
      if (source.subtitleFile != null && source.subtitleFile.length > 0) {
        url = url + "|||" + source.subtitleFile;
      }
      paths = [url];
    }

    if (source.blacklist && source.blacklist.length > 0) {
      paths = paths.filter((url: string) => !source.blacklist.includes(url));
    }
    allURLs = processAllURLs(paths, allURLs, source, weight, helpers);
    helpers.next = null;

    pm({
      data: paths,
      allURLs: allURLs,
      allPosts: allPosts,
      weight: weight,
      helpers: helpers,
      source: source,
      timeout: 0,
    });
  };

  if (!isVideo(url, false)) {
    missingVideo();
  }
  if (url.startsWith("http")) {
    wretch(url)
      .get()
      .notFound((e) => {
        missingVideo();
      })
      .res((r) => {
        ifExists(url);
      });
  } else {
    const exists = fs.existsSync(url);
    if (exists) {
      ifExists(url);
    } else {
      missingVideo();
    }
  }
};

const loadPlaylist = (
  pm: Function,
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  cachePath: string,
) => {
  const url = cachePath ? cachePath : source.url;
  wretch(url)
    .get()
    .text((data) => {
      let urls = [];
      if (url.endsWith(".asx")) {
        const refs = new DOMParser()
          .parseFromString(data, "text/xml")
          .getElementsByTagName("Ref");
        for (let r = 0; r < refs.length; r++) {
          const l = refs[r];
          urls.push(l.getAttribute("href"));
        }
      } else if (url.endsWith(".m3u8")) {
        for (let l of data.split("\n")) {
          if (l.length > 0 && !l.startsWith("#")) {
            urls.push(l.trim());
          }
        }
      } else if (url.endsWith(".pls")) {
        for (let l of data.split("\n")) {
          if (l.startsWith("File")) {
            urls.push(l.split("=")[1].trim());
          }
        }
      } else if (url.endsWith(".xspf")) {
        const locations = new DOMParser()
          .parseFromString(data, "text/xml")
          .getElementsByTagName("location");
        for (let r = 0; r < locations.length; r++) {
          const l = locations[r];
          urls.push(l.textContent);
        }
      }

      if (urls.length > 0) {
        helpers.count = urls.length;
      }

      urls = filterPathsToJustPlayable(filter, urls, true);

      if (source.blacklist && source.blacklist.length > 0) {
        urls = urls.filter((url: string) => !source.blacklist.includes(url));
      }
      allURLs = processAllURLs(urls, allURLs, source, weight, helpers);
      helpers.next = null;

      pm({
        data: urls,
        allURLs: allURLs,
        allPosts: allPosts,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: 0,
      });
    })
    .catch((e) => {
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: 0,
      });
    });
};

export function loadSources(
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  cacheDir: string,
  onLoaded: (object: any) => void
) {
  const pm = (object: any) => {
    if (
      object?.source &&
      object?.data &&
      object?.allURLs &&
      object?.weight &&
      object?.helpers
    ) {
      const source = object.source;
      if (source.blacklist && source.blacklist.length > 0) {
        object.data = object.data.filter(
          (url: string) => !source.blacklist.includes(url),
        );
      }
      object.allURLs = processAllURLs(
        object.data,
        object.allURLs,
        object.source,
        object.weight,
        object.helpers,
      );
    }

    onLoaded(object)
  };

  // Determine what kind of source we have based on the URL
  const sourceType = getSourceType(source.url);
  if (sourceType == ST.local) {
    // Local files
    loadLocalDirectory(
      pm,
      allURLs,
      allPosts,
      config,
      source,
      filter,
      weight,
      helpers,
      null,
    );
  } else if (sourceType == ST.list) {
    // Image List
    helpers.next = null;
    loadRemoteImageURLList(
      allURLs,
      allPosts,
      config,
      source,
      filter,
      weight,
      helpers,
      pm,
    );
  } else if (sourceType == ST.video) {
    const cachePath = cacheDir + getFileName(source.url, path.sep);
    loadVideo(
      pm,
      allURLs,
      allPosts,
      config,
      source,
      filter,
      weight,
      helpers,
      config.caching.enabled && fs.existsSync(cachePath) ? cachePath : null,
    );
  } else if (sourceType == ST.playlist) {
    const cachePath = cacheDir + getFileName(source.url, path.sep);
    loadPlaylist(
      pm,
      allURLs,
      allPosts,
      config,
      source,
      filter,
      weight,
      helpers,
      config.caching.enabled && fs.existsSync(cachePath) ? cachePath : null,
    );
  } else if (sourceType == ST.nimja) {
    loadNimja(
      pm,
      allURLs,
      allPosts,
      config,
      source,
      filter,
      weight,
      helpers,
      null,
    );
  } else {
    // Paging sources
    let workerFunction: any;
    if (sourceType == ST.tumblr) {
      workerFunction = loadTumblr;
    } else if (sourceType == ST.reddit) {
      workerFunction = loadReddit;
    } else if (sourceType == ST.redgifs) {
      workerFunction = loadRedGifs;
    } else if (sourceType == ST.imagefap) {
      workerFunction = loadImageFap;
    } else if (sourceType == ST.sexcom) {
      workerFunction = loadSexCom;
    } else if (sourceType == ST.imgur) {
      workerFunction = loadImgur;
    } else if (sourceType == ST.deviantart) {
      workerFunction = loadDeviantArt;
    } else if (sourceType == ST.danbooru) {
      workerFunction = loadDanbooru;
    } else if (sourceType == ST.e621) {
      workerFunction = loadE621;
    } else if (sourceType == ST.luscious) {
      workerFunction = loadLuscious;
    } else if (sourceType == ST.gelbooru1) {
      workerFunction = loadGelbooru1;
    } else if (sourceType == ST.gelbooru2) {
      workerFunction = loadGelbooru2;
    } else if (sourceType == ST.ehentai) {
      workerFunction = loadEHentai;
    } else if (sourceType == ST.bdsmlr) {
      workerFunction = loadBDSMlr;
    } else if (sourceType == ST.hydrus) {
      workerFunction = loadHydrus;
    } else if (sourceType == ST.piwigo) {
      workerFunction = loadPiwigo;
    }
    if (helpers.next == -1) {
      helpers.next = 0;
      const cachePath = cacheDir;
      if (
        config.caching.enabled &&
        fs.existsSync(cachePath) &&
        fs.readdirSync(cachePath).length > 0
      ) {
        // If the cache directory exists, use it
        loadLocalDirectory(
          pm,
          allURLs,
          allPosts,
          config,
          source,
          filter,
          weight,
          helpers,
          cachePath,
        );
      } else {
        workerFunction(
          allURLs,
          allPosts,
          config,
          source,
          filter,
          weight,
          helpers,
          pm,
        );
      }
    } else {
      workerFunction(
        allURLs,
        allPosts,
        config,
        source,
        filter,
        weight,
        helpers,
        pm,
      );
    }
  }
}