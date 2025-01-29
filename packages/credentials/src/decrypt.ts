import { decryptV1 } from "./decryptV1";
import { decryptV2 } from "./decryptV2";

export const decrypt = async (
  encryptedData: string,
  ivHex: string,
): Promise<object> => {
  if (ivHex.length !== 24) return decryptV1(encryptedData, ivHex);
  return decryptV2(encryptedData, ivHex);
};
