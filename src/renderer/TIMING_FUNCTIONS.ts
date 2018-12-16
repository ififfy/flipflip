export default new Map<String, () => number>([
  ['0.5s', () => 500],
  ['1s', () => 1000],
  ['2s', () => 2000],
  ['5s', () => 5000],
  ['10s', () => 10000],
  ['30s', () => 30000],
  ['variableFast', () => (Math.sin(Date.now() / 1000) + 1) / 2 * 600],
  ['variableMedium', () => (Math.sin(Date.now() / 1000) + 1) / 2 * 1000 + 200],
  ['variableSlow', () => (Math.sin(Date.now() / 1000) + 1) / 2 * 2000 + 3000],
  ['variableSlowest', () => (Math.sin(Date.now() / 1000) + 1) / 2 * 3000 + 3500],
]);