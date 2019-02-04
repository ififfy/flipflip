const TF = {  // timing functions
  constant: 'tf.c',
  variableFast: 'tf.variableFast',
  variableMedium: 'tf.variableMedium',
  variableSlow: 'tf.variableSlow',
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

const TK = { // text kind
  url: 'tk.url',
  hastebin: 'tk.hastebin',
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

const ST = { // sort type
  alphaA: 'st.alphaA',
  alphaD: 'st.alphaD',
  dateA: 'st.dateA',
  dateD: 'st.dateD',
  type: 'st.type',
};

export {
  TF, IF, ZF, HTF, VTF, TK, BT, GT, TT, ST,
};