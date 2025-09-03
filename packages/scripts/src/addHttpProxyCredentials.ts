import { encrypt } from "@typebot.io/credentials/encrypt";
import type { HttpProxyCredentials } from "@typebot.io/credentials/schemas";
import prisma from "@typebot.io/prisma";

const addHttpProxyCredentials = async () => {
  const httpProxyCredentials: Omit<
    HttpProxyCredentials,
    "id" | "createdAt" | "iv"
  > = {
    type: "http proxy",
    data: {
      url: "",
    },
    name: "",
  };

  const { encryptedData, iv } = await encrypt(httpProxyCredentials.data);

  const credentials = await prisma.credentials.create({
    data: {
      data: encryptedData,
      iv,
      name: httpProxyCredentials.name,
      type: httpProxyCredentials.type,
      workspaceId: "",
    },
  });

  console.log(credentials);
};

addHttpProxyCredentials();
