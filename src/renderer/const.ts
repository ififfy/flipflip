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

const TK = { // text kind
  url: 'tk.url',
  hastebin: 'tk.hastebin',
};

export {
  TF, IF, ZF, TK
};