const pm = (object: any) => {
  // @ts-ignore
  postMessage(object);
}

export const sendMessage = (message: string) => {
  pm(message);
}