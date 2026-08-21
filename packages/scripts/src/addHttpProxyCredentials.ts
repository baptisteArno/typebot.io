import { encrypt } from "@typebot.io/credentials/encrypt";
import type { HttpProxyCredentials } from "@typebot.io/credentials/schemas";
import prisma from "@typebot.io/prisma";
import {
  assertProductionEnvironment,
  confirmAction,
  getRequiredInput,
  runScript,
} from "./cli";

const addHttpProxyCredentials = async () => {
  assertProductionEnvironment();
  const url = await getRequiredInput({
    message: "Proxy URL?",
    name: "url",
    validate: validateUrl,
  });
  const name = await getRequiredInput({
    message: "Credentials name?",
    name: "name",
  });
  const workspaceId = await getRequiredInput({
    message: "Workspace ID?",
    name: "workspace-id",
  });

  if (
    !(await confirmAction({
      message: `Add ${name} proxy credentials to production workspace ${workspaceId}?`,
    }))
  )
    return;

  const httpProxyCredentials: Omit<
    HttpProxyCredentials,
    "id" | "createdAt" | "iv"
  > = {
    type: "http proxy",
    data: {
      url,
    },
    name,
  };

  const { encryptedData, iv } = await encrypt(httpProxyCredentials.data);

  const credentials = await prisma.credentials.create({
    data: {
      data: encryptedData,
      iv,
      name: httpProxyCredentials.name,
      type: httpProxyCredentials.type,
      workspaceId,
    },
  });

  console.log(credentials);
};

const validateUrl = (value: string) => {
  try {
    new URL(value);
    return undefined;
  } catch {
    return "Expected a valid URL";
  }
};

runScript(addHttpProxyCredentials);
