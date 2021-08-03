export default class WeightGroup {
  percent: number;
  type: string;
  search: string;
  max: number;
  chosen: number;
  rules: Array<WeightGroup>;

  constructor(init?: Partial<WeightGroup>) {
    Object.assign(this, init);
  }
}