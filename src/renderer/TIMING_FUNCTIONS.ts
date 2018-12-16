export default new Map<String, () => number>([
  ['1s', () => 1000],
  ['variableFast', () => (Math.sin(Date.now() / 1000) + 1) / 2 * 600],
  ['variableMedium', () => (Math.sin(Date.now() / 1000) + 1) / 2 * 1000 + 200],
  ['variableSlow', () => (Math.sin(Date.now() / 1000) + 1) / 2 * 2000 + 3000],
  ['variableSlowest', () => (Math.sin(Date.now() / 1000) + 1) / 2 * 3000 + 3500],
]);