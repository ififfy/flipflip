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

const VC = { // Video Control Modes
  player: 'vc.p',
  sceneClipper: 'vc.sc',
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

export {
  TF, WF, OF, IF, GO, VO, HTF, VTF, BT, GT, TT, SF, ST, SL, AF, IPC, VC, MO, PR, SB, IG
};