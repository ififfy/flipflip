const TF = {  // timing functions
  constant: 'tf.c',
  random: 'tf.random',
  sin: 'tf.sin',
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

const TOT = { // text overlay type
  url: 'tot.url',
  hastebin: 'tot.hastebin',
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
  alphaA: 'sf.alphaA',
  alphaD: 'sf.alphaD',
  alphaFullA: 'sf.alphaFullA',
  alphaFullD: 'sf.alphaFullD',
  dateA: 'sf.dateA',
  dateD: 'sf.dateD',
  countA: 'sf.countA',
  countD: 'sf.countD',
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
  sceneDetail: 'vc.sd',
  player: 'vc.p',
  sceneClipper: 'vc.sc',
};

export {
  TF, WF, OF, IF, GO, VO, HTF, VTF, TOT, BT, GT, TT, SF, ST, SL, AF, IPC, VC
};