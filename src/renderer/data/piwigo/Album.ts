export default interface Album {
  id: number;
  tn_url: string;
  name: string;
  comment: string;
  sub_categories: Album[];
}
