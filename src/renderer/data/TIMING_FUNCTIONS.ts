import {TF} from './const';

/*['tf.variableFaster', 'Variable - Really Fast (0.0s-0.6s)'],
  ['tf.variableFast', 'Variable - Fast (0.2s-1.2s)'],
  ['tf.variableMedium', 'Variable - Natural (3.0s-5.0s)'],
  ['tf.variableSlow', 'Variable - Slow (3.5s-6.5s)'],
  ['tf.variableSlower', 'Variable - Slower (10s-20s)'],
  ['tf.variableSlowest', 'Variable - Slowest (30s-60s)'],*/

export default new Map<String, () => number>([
  [TF.variableFaster, () => (Math.sin(Date.now() / 1000) + 1) / 2 * 600],
  [TF.variableFast, () => (Math.sin(Date.now() / 1000) + 1) / 2 * 1000 + 200],
  [TF.variableMedium, () => (Math.sin(Date.now() / 1000) + 1) / 2 * 2000 + 3000],
  [TF.variableSlow, () => (Math.sin(Date.now() / 1000) + 1) / 2 * 3000 + 3500],
  [TF.variableSlower, () => (Math.sin(Date.now() / 1000) + 1) / 2 * 10000 + 10000],
  [TF.variableSlowest, () => (Math.sin(Date.now() / 1000) + 1) / 2 * 30000 + 30000],
]);