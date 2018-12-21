export default new Map<String, () => number>([
  ['tf.0.5s', () => 500],
  ['tf.1s', () => 1000],
  ['tf.2s', () => 2000],
  ['tf.5s', () => 5000],
  ['tf.10s', () => 10000],
  ['tf.30s', () => 30000],
  ['tf.variableFast', () => (Math.sin(Date.now() / 1000) + 1) / 2 * 600],
  ['tf.variableMedium', () => (Math.sin(Date.now() / 1000) + 1) / 2 * 1000 + 200],
  ['tf.variableSlow', () => (Math.sin(Date.now() / 1000) + 1) / 2 * 2000 + 3000],
  ['tf.variableSlowest', () => (Math.sin(Date.now() / 1000) + 1) / 2 * 3000 + 3500],
  ['tf.assault', () => 0],
]);