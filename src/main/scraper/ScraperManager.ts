import fs from 'fs'
import wretch from 'wretch'
import fileUrl from "file-url";
import recursiveReaddir from "recursive-readdir";
import Config from "../../common/Config";
import LibrarySource from "../../common/LibrarySource";
import {IF, ST} from "../../common/const";
import {
  CancelablePromise,
  getCachePath,
  urlToPath,
} from "../../renderer/data/utils";
import {
  filterPathsToJustPlayable,
  getFileName,
  getSourceType,
  isVideo,
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

// Determine what kind of source we have based on the URL and return associated Promise
function scrapeFiles(
  worker: any,
  pm: Function,
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  returnPromise = false,
) {
  const sourceType = getSourceType(source.url);
  if (sourceType == ST.local) {
    // Local files
    if (returnPromise) {
      return new CancelablePromise((resolve) => {
        loadLocalDirectory(
          resolve,
          allURLs,
          allPosts,
          config,
          source,
          filter,
          weight,
          helpers,
          null,
        );
      });
    } else {
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
    }
  } else if (sourceType == ST.list) {
    // Image List
    helpers.next = null;
    if (returnPromise) {
      return new CancelablePromise((resolve) => {
        loadRemoteImageURLListPromise(
          allURLs,
          allPosts,
          config,
          source,
          filter,
          weight,
          helpers,
          resolve,
        );
      });
    } else {
      worker.loadRemoteImageURLList(
        allURLs,
        allPosts,
        config,
        source,
        filter,
        weight,
        helpers,
      );
    }
  } else if (sourceType == ST.video) {
    const cachePath =
      getCachePath(source.url, config) + getFileName(source.url);
    if (returnPromise) {
      return new CancelablePromise((resolve) => {
        loadVideo(
          resolve,
          allURLs,
          allPosts,
          config,
          source,
          filter,
          weight,
          helpers,
          config.caching.enabled && fs.existsSync(cachePath) ? cachePath : null,
        );
      });
    } else {
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
    }
  } else if (sourceType == ST.playlist) {
    const cachePath =
      getCachePath(source.url, config) + getFileName(source.url);
    if (returnPromise) {
      return new CancelablePromise((resolve) => {
        loadPlaylist(
          resolve,
          allURLs,
          allPosts,
          config,
          source,
          filter,
          weight,
          helpers,
          config.caching.enabled && fs.existsSync(cachePath) ? cachePath : null,
        );
      });
    } else {
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
    }
  } else if (sourceType == ST.nimja) {
    if (returnPromise) {
      return new CancelablePromise((resolve) => {
        loadNimja(
          resolve,
          allURLs,
          allPosts,
          config,
          source,
          filter,
          weight,
          helpers,
          null,
        );
      });
    } else {
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
    }
  } else {
    // Paging sources
    let workerFunction: any;
    if (sourceType == ST.tumblr) {
      workerFunction = returnPromise ? loadTumblrPromise : worker.loadTumblr;
    } else if (sourceType == ST.reddit) {
      workerFunction = returnPromise ? loadRedditPromise : worker.loadReddit;
    } else if (sourceType == ST.redgifs) {
      workerFunction = returnPromise ? loadRedGifsPromise : worker.loadRedGifs;
    } else if (sourceType == ST.imagefap) {
      workerFunction = returnPromise
        ? loadImageFapPromise
        : worker.loadImageFap;
    } else if (sourceType == ST.sexcom) {
      workerFunction = returnPromise ? loadSexComPromise : worker.loadSexCom;
    } else if (sourceType == ST.imgur) {
      workerFunction = returnPromise ? loadImgurPromise : worker.loadImgur;
    } else if (sourceType == ST.deviantart) {
      workerFunction = returnPromise
        ? loadDeviantArtPromise
        : worker.loadDeviantArt;
    } else if (sourceType == ST.danbooru) {
      workerFunction = returnPromise
        ? loadDanbooruPromise
        : worker.loadDanbooru;
    } else if (sourceType == ST.e621) {
      workerFunction = returnPromise ? loadE621Promise : worker.loadE621;
    } else if (sourceType == ST.luscious) {
      workerFunction = returnPromise
        ? loadLusciousPromise
        : worker.loadLuscious;
    } else if (sourceType == ST.gelbooru1) {
      workerFunction = returnPromise
        ? loadGelbooru1Promise
        : worker.loadGelbooru1;
    } else if (sourceType == ST.gelbooru2) {
      workerFunction = returnPromise
        ? loadGelbooru2Promise
        : worker.loadGelbooru2;
    } else if (sourceType == ST.ehentai) {
      workerFunction = returnPromise ? loadEHentaiPromise : worker.loadEHentai;
    } else if (sourceType == ST.bdsmlr) {
      workerFunction = returnPromise ? loadBDSMlrPromise : worker.loadBDSMlr;
    } else if (sourceType == ST.hydrus) {
      workerFunction = returnPromise ? loadHydrusPromise : worker.loadHydrus;
    } else if (sourceType == ST.piwigo) {
      workerFunction = returnPromise ? loadPiwigoPromise : worker.loadPiwigo;
    }
    if (helpers.next == -1) {
      helpers.next = 0;
      const cachePath = getCachePath(source.url, config);
      if (config.caching.enabled && fs.existsSync(cachePath) && fs.readdirSync(cachePath).length > 0) {
        // If the cache directory exists, use it
        if (returnPromise) {
          return new CancelablePromise((resolve) => {
            loadLocalDirectory(
              resolve,
              allURLs,
              allPosts,
              config,
              source,
              filter,
              weight,
              helpers,
              cachePath,
            );
          });
        } else {
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
        }
      } else {
        if (returnPromise) {
          return new CancelablePromise((resolve) => {
            workerFunction(
              allURLs,
              allPosts,
              config,
              source,
              filter,
              weight,
              helpers,
              resolve,
            );
          });
        } else {
          workerFunction(
            allURLs,
            allPosts,
            config,
            source,
            filter,
            weight,
            helpers,
          );
        }
      }
    } else {
      if (returnPromise) {
        return new CancelablePromise((resolve) => {
          workerFunction(
            allURLs,
            allPosts,
            config,
            source,
            filter,
            weight,
            helpers,
            resolve,
          );
        });
      } else {
        workerFunction(
          allURLs,
          allPosts,
          config,
          source,
          filter,
          weight,
          helpers,
        );
      }
    }
  }
}

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
    data: {
      data: sources,
      allURLs: allURLs,
      allPosts: allPosts,
      weight: weight,
      helpers: helpers,
      source: source,
      timeout: 0,
    },
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
        data: {
          error: err.message,
          helpers: helpers,
          source: source,
          timeout: 0,
        },
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
            !source.blacklist.includes(urlToPath(url)),
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
        data: {
          data: sources,
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: 0,
        },
      });
    }
  });
};

export const loadVideo = (
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
      data: {
        error: "Could not find " + source.url,
        data: [],
        allURLs: allURLs,
        allPosts: allPosts,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: 0,
      },
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
      data: {
        data: paths,
        allURLs: allURLs,
        allPosts: allPosts,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: 0,
      },
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

export const loadPlaylist = (
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
        data: {
          data: urls,
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: 0,
        },
      });
    })
    .catch((e) => {
      pm({
        data: {
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: 0,
        },
      });
    });
};

const loadRemoteImageURLListPromise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadRemoteImageURLList(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    resolve,
  );
};

const loadTumblrPromise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadTumblr(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    resolve,
  );
};

const loadRedditPromise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadReddit(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    resolve,
  );
};

const loadRedGifsPromise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadRedGifs(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    resolve,
  );
};

const loadImageFapPromise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadImageFap(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    resolve,
  );
};

const loadSexComPromise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadSexCom(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    resolve,
  );
};

const loadImgurPromise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadImgur(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    resolve,
  );
};

const loadDeviantArtPromise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadDeviantArt(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    resolve,
  );
};

const loadDanbooruPromise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadDanbooru(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    resolve,
  );
};

const loadE621Promise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadE621(allURLs, allPosts, config, source, filter, weight, helpers, resolve);
};

const loadGelbooru1Promise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadGelbooru1(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    resolve,
  );
};

const loadGelbooru2Promise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadGelbooru2(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    resolve,
  );
};

const loadEHentaiPromise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadEHentai(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    resolve,
  );
};

const loadBDSMlrPromise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadBDSMlr(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    resolve,
  );
};

const loadHydrusPromise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadHydrus(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    resolve,
  );
};

const loadPiwigoPromise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadPiwigo(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    resolve,
  );
};

const loadLusciousPromise = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  resolve: Function,
) => {
  loadLuscious(
    allURLs,
    allPosts,
    config,
    source,
    filter,
    weight,
    helpers,
    resolve,
  );
};