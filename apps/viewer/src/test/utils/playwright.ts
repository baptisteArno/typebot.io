import path from "node:path";

export const getTestAsset = (name: string) =>
  path.join(__dirname, "..", "assets", name);
