import ky from "ky";

export const getUserInfo = async (accessToken: string) => {
  const data = await ky
    .get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .json<{
      name: string;
      email: string;
      picture: string;
    }>();

  return data;
};
