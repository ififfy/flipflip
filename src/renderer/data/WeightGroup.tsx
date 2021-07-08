import Tag from "./Tag";

export default class WeightGroup {
  percent: number;
  type: string;
  tag: Tag;
  max: number;
  chosen: number;
  rules: Array<WeightGroup>;

  constructor(init?: Partial<Tag>) {
    Object.assign(this, init);
  }
}