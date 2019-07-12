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

const IF = { // image filters
  any: 'if.any',
  videos: 'if.videos',
  gifs: 'if.gifs',
  stills: 'if.stills',
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
};

const SL = { // strobe layers
  top: 'sl.top',
  middle: 'sl.middle',
  background: 'sl.background',
  bottom: 'sl.bottom',
};

const AF = { // add functions
  url: 'af.url',
  directory: 'af.directory',
  videos: 'af.videos',
  library: 'af.library',
};

export {
  TF, WF, IF, HTF, VTF, TOT, BT, GT, TT, SF, ST, SL, AF
};