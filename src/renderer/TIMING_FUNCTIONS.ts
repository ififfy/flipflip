import {TF} from './const';

export default new Map<String, () => number>([
  [TF.variableFaster, () => (Math.sin(Date.now() / 1000) + 1) / 2 * 600],
  [TF.variableFast, () => (Math.sin(Date.now() / 1000) + 1) / 2 * 1000 + 200],
  [TF.variableMedium, () => (Math.sin(Date.now() / 1000) + 1) / 2 * 2000 + 3000],
  [TF.variableSlow, () => (Math.sin(Date.now() / 1000) + 1) / 2 * 3000 + 3500],
  [TF.variableSlower, () => (Math.sin(Date.now() / 1000) + 1) / 2 * 10000 + 10000],
  [TF.variableSlowest, () => (Math.sin(Date.now() / 1000) + 1) / 2 * 30000 + 30000],
]);