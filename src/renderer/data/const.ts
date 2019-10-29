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

const OF = {
  strict: 'of.strict',
  ordered: 'of.ordered',
  random: 'of.random',
};

const IF = { // image filters
  any: 'if.any',
  videos: 'if.videos',
  gifs: 'if.gifs',
  stills: 'if.stills',
};

const GO = { // GIF Options
  none: 'go.none',
  part: 'go.part',
  full: 'go.full',
};

const VO = { // Video Options
  none: 'vo.none',
  part: 'vo.part',
  full: 'vo.full',
};

const BT = { // background type
  blur: 'bt.blur',
  color: 'bt.color',
  none: 'bt.none',
};

const IT = { // image type
  fitBestNoClip: 'it.fitBestNoClip',
  fitBestClip: 'it.fitBestClip',
  stretch: 'it.stretch',
  center: 'it.center',
  fitWidth: 'it.fitWidth',
  fitHeight: 'it.fitHeight',
};

const HTF = { // horizontal translate functions
  none: 'htf.none',
  left: 'htf.left',
  right: 'htf.right',
};

const VTF = { // vertical translate functions
  none: 'vtf.none',
  up: 'vtf.up',
  down: 'vtf.down',
};

const GT = { // gooninator import type
  tumblr: 'gt.tumblr',
  local: 'gt.local',
};

const TT = { // tag type
  weight: 'tt.weight',
  all: 'tt.all',
  none: 'tt.none',
};

const SF = { // sort function
  alpha: 'sf.alpha',
  alphaFull: 'sf.alphaFull',
  date: 'sf.date',
  count: 'sf.count',
  type: 'sf.type',
};

const ST = { // source types
  local: 'st.local',
  video: 'st.video',
  list: 'st.list',
  tumblr: 'st.tumblr',
  reddit: 'st.reddit',
  imagefap: 'st.imagefap',
  sexcom: 'st.sexcom',
  imgur: 'st.imgur',
  twitter: 'st.twitter',
  deviantart: 'st.deviantart',
  instagram: 'st.instagram',
  danbooru: 'st.danbooru',
  gelbooru1: 'st.gelbooru1',
  gelbooru2: 'st.gelbooru2',
  ehentai: 'st.ehentai',
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
  library: 'af.library',
};

const IPC = {
  newWindow: 'ipc.newWindow',
  startScene: 'ipc.startScene',
};

const MO = { // Menu/Modal Constants
  new: 'mo.new',
  sort: 'mo.sort',
  batchTag: 'mo.batchtag',
  urlImport: 'mo.urlimport',
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
};

const PR = { // Global progress functions
  cancel: 'pr.cancel',
  complete: 'pr.complete',
  offline: 'pr.offline',
  tumblr: 'pr.tumblr',
  reddit: 'pr.reddit',
  twitter: 'pr.twitter',
  instagram: 'pr.instagram',
};

const SB = { // Snackbar variants
  error: 'sb.error',
  warning: 'sb.warning',
  info: 'sb.info',
  success: 'sb.success',
};

const IG = { // Instagram modes
  tfa: 'ig.tfa',
  checkpoint: 'ig.checkpoint',
};

const SPT = { // Scene Picker Tutorials
  welcome: 'spt1',
  scenePicker: 'spt2',
  drawer: 'spt3',
  add1: 'spt4',
  add2: 'spt5',
  done: 'done',
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
  imageSizing: 'sdt15',
  nextScene: 'sdt16',
  overlays: 'sdt17',
  optionsRight: 'sdt18',
  imageOptions: 'sdt19',
  videoOptions: 'sdt20',
  weighting: 'sdt21',
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
  done: 'done',
};

const PT = { // Player Tutorials
  welcome: 'pt1',
  toolbar: 'pt2',
  sidebar: 'pt3',
  tagging: 'pt4',
  final: 'pt5',
  done: 'done',
};

const LT = { // Library Tutorials
  welcome: 'lt1',
  library: 'lt2',
  toolbar: 'lt3',
  sidebar1: 'lt4',
  sidebar2: 'lt5',
  final: 'lt6',
  done: 'dont',
};

export {
  TF, WF, OF, IF, GO, VO, HTF, VTF, BT, IT, GT, TT, SF, ST, SL, AF, IPC, MO, PR, SB, IG, SPT, SDT, PT, LT,
};