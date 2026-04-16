export default interface ScenePickerInitResponse {
  isFirstWindow: boolean;
  update?: {
    releaseTag: string;
    releaseURL: string;
  };
}
