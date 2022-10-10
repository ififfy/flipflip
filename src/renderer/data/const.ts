const TF = {  // timing functions
  constant: 'tf.c',
  random: 'tf.random',
  sin: 'tf.sin',
  bpm: 'tf.bpm',
  scene: 'tf.scene',
};

const WF = { // weight functions
  sources: 'wf.s',
  images: 'wf.i',
};

const SOF = {
  ordered: 'sof.ordered',
  random: 'sof.random',
};

const OF = {
  strict: 'of.strict',
  ordered: 'of.ordered',
  random: 'of.random',
};

const IF = { // image filters
  any: 'if.any',
  videos: 'if.videos',
  animated: 'if.gifs',
  images: 'if.images',
  stills: 'if.stills',
};

const OT = { // orientation
  original: 'ot.original',
  onlyLandscape: 'ot.onlylandscape',
  onlyPortrait: 'ot.onlyportrait',
  forceLandscape: 'ot.forcelandscape',
  forcePortrait: 'ot.forceportrait',
}

const GO = { // GIF Options
  none: 'go.none',
  part: 'go.part',
  partr: 'go.partr',
  atLeast: 'go.atleast',
  full: 'go.full',
};

const VO = { // Video Options
  none: 'vo.none',
  part: 'vo.part',
  partr: 'vo.partr',
  atLeast: 'vo.atleast',
  full: 'vo.full',
};

const RP = { // Audio Repeat Options
  none: 'rp.none',
  one: 'rp.one',
  all: 'rp.all',
}

const BT = { // background type
  blur: 'bt.blur',
  color: 'bt.color',
  colorSet: 'bt.colorset',
  colorRand: 'bt.colorrand',
  none: 'bt.none',
};

const SC = { // strobe color type
  color: 'bt.color',
  colorSet: 'bt.colorset',
  colorRand: 'bt.colorrand',
};

const IT = { // image type
  fitBestNoClip: 'it.fitBestNoClip',
  fitBestClip: 'it.fitBestClip',
  stretch: 'it.stretch',
  center: 'it.center',
  centerNoClip: 'it.centerNoClip',
  fitWidth: 'it.fitWidth',
  fitHeight: 'it.fitHeight',
};

const HTF = { // horizontal translate functions
  none: 'htf.none',
  left: 'htf.left',
  right: 'htf.right',
  random: 'htf.random',
};

const VTF = { // vertical translate functions
  none: 'vtf.none',
  up: 'vtf.up',
  down: 'vtf.down',
  random: 'vtf.random',
};

const STF = { // Slide type function
  left: 'stf.left',
  right: 'stf.right',
  leftright: 'stf.leftright',
  up: 'stf.up',
  down: 'stf.down',
  updown: 'stf.updown',
  random: 'stf.random',
};

const GT = { // gooninator import type
  tumblr: 'gt.tumblr',
  local: 'gt.local',
};

const TT = { // tag type
  weight: 'tt.weight',
  all: 'tt.all',
  none: 'tt.none',
  or: 'tt.or'
};

const SF = { // sort function
  alpha: 'sf.alpha',
  alphaFull: 'sf.alphaFull',
  date: 'sf.date',
  count: 'sf.count',
  type: 'sf.type',
  duration: 'sf.duration',
  resolution: 'sf.resolution',
  random: 'sf.random',
};

const ASF = { // audio sort function
  url: 'asf.url',
  name: 'asf.name',
  artist: 'asf.artist',
  album: 'asf.album',
  date: 'asf.date',
  duration: 'asf.duration',
  trackNum: 'asf.tracknum',
  playedCount: 'asf.playedcount',
  random: 'asf.random',
};

const ST = { // source types
  local: 'st.local',
  video: 'st.video',
  playlist: 'st.playlist',
  list: 'st.list',
  tumblr: 'st.tumblr',
  reddit: 'st.reddit',
  redgifs: 'st.redgifs',
  imagefap: 'st.imagefap',
  sexcom: 'st.sexcom',
  imgur: 'st.imgur',
  twitter: 'st.twitter',
  deviantart: 'st.deviantart',
  instagram: 'st.instagram',
  danbooru: 'st.danbooru',
  e621: 'st.e621',
  luscious: 'st.luscious',
  gelbooru1: 'st.gelbooru1',
  gelbooru2: 'st.gelbooru2',
  ehentai: 'st.ehentai',
  bdsmlr: 'st.bdsmlr',
  hydrus: 'st.hydrus',
  piwigo: 'st.piwigo',
  nimja: 'st.nimja',
  audio: 'st.audio'
};

const SL = { // strobe layers
  top: 'sl.top',
  middle: 'sl.middle',
  image: 'sl.image',
  background: 'sl.background',
  bottom: 'sl.bottom',
};

const AF = { // add functions
  url: 'af.url',
  directory: 'af.directory',
  videos: 'af.videos',
  videoDir: 'af.videodir',
  library: 'af.library',
  audios: 'af.audio',
  script: 'af.script',
};

const IPC = {
  newWindow: 'ipc.newWindow',
  startScene: 'ipc.startScene',
};

const MO = { // Menu/Modal Constants
  new: 'mo.new',
  sort: 'mo.sort',
  batchClip: 'mo.batchclip',
  batchTag: 'mo.batchtag',
  batchEdit: 'mo.batchedit',
  playlist: 'mo.playlist',
  newPlaylist: 'mo.newplaylist',
  playlistDuplicates: 'mo.playlistduplicates',
  urlImport: 'mo.urlimport',
  libraryImport: 'mo.libraryImport',
  newWindowAlert: 'mo.nwalert',
  removeAllAlert: 'mo.raalert',
  deleteAlert: 'mo.dalert',
  simpleRule: 'mo.srule',
  max: 'mo.max',
  error: 'mo.error',
  backup: 'mo.backup',
  restore: 'mo.restore',
  signIn: 'mo.signin',
  signOut: 'mo.signout',
  open: 'mo.open',
  openLocal: 'mo.openlocal',
  openLibrary: 'mo.openlibrary',
  save: 'mo.save',
  load: 'mo.load',
  select: 'mo.select',
  piwigo: 'mo.piwigo',
  effects: 'mo.effects',
};

const PR = { // Global progress functions
  cancel: 'pr.cancel',
  complete: 'pr.complete',
  audioOffline: 'pr.audioOffline',
  offline: 'pr.offline',
  videoMetadata: 'pr.video',
  bpm: 'pr.bpm',
  tumblr: 'pr.tumblr',
  reddit: 'pr.reddit',
  twitter: 'pr.twitter',
  instagram: 'pr.instagram',
};

const IG = { // Instagram modes
  tfa: 'ig.tfa',
  checkpoint: 'ig.checkpoint',
};

const RF = { // Reddit functions
  hot: 'rf.hot',
  new: 'rf.new',
  top: 'rf.top',
  controversial: 'rf.cont',
  rising: 'rf.rising',
};

const RT = { // Reddit timespan
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
  all: 'all',
};

const SG = { // Scene group types
  scene: 'sg.scene',
  generator: 'sg.generator',
  grid: 'sg.grid',
}

const DONE = 'done';

const SPT = { // Scene Picker Tutorials
  welcome: 'spt1',
  scenePicker: 'spt2',
  drawer: 'spt3',
  add1: 'spt4',
  add2: 'spt5',
  done: DONE,
};

const SDT = { // Scene Detail Tutorials
  welcome: 'sdt1',
  title: 'sdt2',
  add1: 'sdt3',
  add2: 'sdt4',
  source: 'sdt5',
  sourceAvatar: 'sdt6',
  sourceTitle: 'sdt7',
  sourceTags: 'sdt8',
  sourceCount: 'sdt9',
  sourceButtons: 'sdt10',
  options1: 'sdt11',
  options2: 'sdt12',
  optionsLeft: 'sdt13',
  timing: 'sdt14',
  backForth: 'sdt.33',
  imageSizing: 'sdt15',
  nextScene: 'sdt16',
  overlays: 'sdt17',
  optionsRight: 'sdt18',
  imageOptions: 'sdt19',
  videoOptions: 'sdt20',
  weighting: 'sdt21',
  sordering: 'sdt32',
  ordering: 'sdt22',
  effects1: 'sdt23',
  effects2: 'sdt24',
  zoom1: 'sdt25',
  zoom2: 'sdt26',
  zoom3: 'sdt27',
  zoom4: 'sdt28',
  fade1: 'sdt29',
  fade2: 'sdt30',
  play: 'sdt31',
  done: DONE,
};

const PT = { // Player Tutorials
  welcome: 'pt1',
  toolbar: 'pt2',
  sidebar: 'pt3',
  tagging: 'pt4',
  final: 'pt5',
  done: DONE,
};

const LT = { // Library Tutorials
  welcome: 'lt1',
  library: 'lt2',
  toolbar: 'lt3',
  sidebar1: 'lt4',
  sidebar2: 'lt5',
  final: 'lt6',
  done: DONE,
};

const ALT = { // Audio Library Tutorials
  welcome: 'alt1',
  library: 'alt2',
  toolbar: 'alt3',
  sidebar1: 'alt4',
  sidebar2: 'alt5',
  final: 'alt6',
  done: DONE,
};

const SLT = { // Script Library Tutorials
  welcome: 'slt1',
  library: 'slt2',
  toolbar: 'slt3',
  sidebar1: 'slt4',
  sidebar2: 'slt5',
  final: 'slt6',
  done: DONE,
};

const CST = { // Caption Scriptor Tutorials
  welcome: 'cst1',
  code: 'cst2',
  player: 'cst3',
  fonts: 'cst4',
  menu: 'cst5',
  actions: 'cst6',
  final: 'cst7',
  done: DONE,
};

const SDGT = { // Scene Generator Tutorials
  welcome: 'sdgt1',
  buttons: 'sdgt2',
  edit1: 'sdgt3',
  edit2: 'sdgt4',
  generate: 'sdgt5',
  generateError: 'sdgt5E',
  final: 'sdgt6',
  finalError: 'sdgt6E',
  done: DONE,
};

const SGT = { // Scene Grid Tutorials
  welcome: 'sgt1',
  dimensions: 'sgt2',
  cells: 'sgt3',
  mirror: 'sgt4',
  final: 'sgdt5',
  done: DONE,
};

const VCT = { // Video Clipper Tutorials
  welcome: 'vct1',
  controls: 'vct2',
  clips: 'vct3',
  clip: 'vct4',
  final: 'vct5',
  done: DONE,
};

const EA = { // Easings
  linear: 'ea.linear',
  sinIn: 'ea.sinIn',
  sinOut: 'ea.sinOut',
  sinInOut: 'ea.sinInOut',
  expIn: 'ea.expIn',
  expOut: 'ea.expOut',
  expInOut: 'ea.expInOut',
  circleIn: 'ea.circleIn',
  circleOut: 'ea.circleOut',
  circleInOut: 'ea.circleInOut',
  bounceIn: 'ea.bounceIn',
  bounceOut: 'ea.bounceOut',
  bounceInOut: 'ea.bounceInOut',
  polyIn: 'ea.polyIn',
  polyOut: 'ea.polyOut',
  polyInOut: 'ea.polyInOut',
  elasticIn: 'ea.elasticIn',
  elasticOut: 'ea.elasticOut',
  elasticInOut: 'ea.elasticInOut',
  backIn: 'ea.backIn',
  backOut: 'ea.backOut',
  backInOut: 'ea.backInOut',
}

const SP = { // Special modes
  addToPlaylist: 'sp.addToPlaylist',
  autoEdit: 'sp.autoEdit',
  batchClip: 'sp.batchClip',
  batchTag: 'sp.batchTag',
  batchEdit: 'sp.batchEdit',
  select: 'sp.select',
  selectSingle: 'sp.selectSingle',
}

const WC = { // Watermark corner
  bottomRight: 'wc.bottomRight',
  bottomLeft: 'wc.bottomLeft',
  topRight: 'wc.topRight',
  topLeft: 'wc.topLeft',
}

const PW = { // Piwigo types
  apiTypeFavorites: 'pwg.users.favorites.getList',
  apiTypeCategory: 'pwg.categories.getImages',
  apiTypeTag: 'pwg.tags.getImages',
}

const PWS = { // Piwigo sort types
  sortOptionAvailable: 'date_available',
  sortOptionCreated: 'date_creation',
  sortOptionName: 'name',
  sortOptionFile: 'file',
  sortOptionHit: 'hit',
  sortOptionID: 'id',
  sortOptionRating: 'rating_score',
  sortOptionRandom: 'random',
}

const SS = { // MUI Snack Severity
  error: 'error',
  warning: 'warning',
  info: 'info',
  success: 'success',
}

export {
  AF, ALT, ASF, BT, CST, DONE, EA, GO, GT, HTF, IF, IG, IPC, IT, LT, MO, OF, OT, PR, PT, PW, PWS, RF, RP, RT, SC, SDGT, SDT, SF, SG, SGT, SL, SLT, STF, SOF, SP, SPT, SS, ST, TF, TT, VCT, VO, VTF, WC, WF
};