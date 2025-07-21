import { getUserInfo } from "./getUserName";

export const parseFrom = async (
  from: string | undefined,
  { accessToken }: { accessToken: string },
) => {
  if (from) {
    if (from.includes("@")) return from;
    const { email } = await getUserInfo(accessToken);
    return `${from} <${email}>`;
  }

  const { name, email } = await getUserInfo(accessToken);
  return `${name} <${email}>`;
};
