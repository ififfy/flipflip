const TF = {  // timing functions
  constant: 'tf.c',
  variableFaster: 'tf.variableFaster',
  variableFast: 'tf.variableFast',
  variableMedium: 'tf.variableMedium',
  variableSlow: 'tf.variableSlow',
  variableSlower: 'tf.variableSlower',
  variableSlowest: 'tf.variableSlowest',
};

const IF = { // image filters
  any: 'if.any',
  gifs: 'if.gifs',
  stills: 'if.stills',
};

const ZF = { // zoom functions
  none: 'zf.none',
  in: 'zf.in',
  out: 'zf.out',
};

const BT = { // background type
  blur: 'bt.blur',
  color: 'bt.color',
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
  list: 'st.list',
  tumblr: 'st.tumblr',
  reddit: 'st.reddit',
  imagefap: 'st.imagefap',
  sexcom: 'st.sexcom',
  imgur: 'st.imgur',
  twitter: 'st.twitter',
  deviantart: 'st.deviantart',
};

export {
  TF, IF, ZF, HTF, VTF, TOT, BT, GT, TT, SF, ST,
};