export default new Map<String, String>([
  ['tf.c', 'Constant'],
  ['tf.variableFast', 'Variable - Really Fast (0.0s-0.6s)'],
  ['tf.variableMedium', 'Variable - Fast (0.2s-1.2s)'],
  ['tf.variableSlow', 'Variable - Slow (3.0s-5.0s)'],
  ['tf.variableSlowest', 'Variable - Slowest (3.5s-6.5s)'],

  ['if.any', 'All images'],
  ['if.gifs', 'Only gifs'],
  ['if.stills', 'Only stills'],

  ['zf.none','No zoom'],
  ['zf.in','Zoom In'],
  ['zf.out','Zoom Out'],

  ['bt.blur', 'Blurred'],
  ['bt.color', 'Solid Color'],

  ['htf.none','None'],
  ['htf.left','Left'],
  ['htf.right','Right'],

  ['vtf.none','None'],
  ['vtf.up','Up'],
  ['vtf.down','Down'],

  ['tk.url', 'URL'],
  ['tk.hastebin', 'Hastebin'],
]);