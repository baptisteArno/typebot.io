import { createId } from "@paralleldrive/cuid2";
import { defaultOpenAIOptions } from "@typebot.io/blocks-integrations/openai/constants";
import type {
  CreateSpeechOpenAIOptions,
  OpenAICredentials,
} from "@typebot.io/blocks-integrations/openai/schema";
import { decrypt } from "@typebot.io/lib/api/encryption/decrypt";
import { uploadFileToBucket } from "@typebot.io/lib/s3/uploadFileToBucket";
import { isNotEmpty } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import OpenAI, { type ClientOptions } from "openai";
import type { SessionState } from "../../../../../schemas/chatSession";
import type { ExecuteIntegrationResponse } from "../../../../../types";
import { updateVariablesInSession } from "../../../../../updateVariablesInSession";

export const createSpeechOpenAI = async (
  state: SessionState,
  {
    outgoingEdgeId,
    options,
  }: {
    outgoingEdgeId?: string;
    options: CreateSpeechOpenAIOptions;
  },
): Promise<ExecuteIntegrationResponse> => {
  let newSessionState = state;
  const noCredentialsError = {
    status: "error",
    description: "Make sure to select an OpenAI account",
  };

  if (!options.input || !options.voice || !options.saveUrlInVariableId) {
    return {
      outgoingEdgeId,
      logs: [
        {
          status: "error",
          description:
            "Make sure to enter an input, select a voice and select a variable to save the URL in",
        },
      ],
    };
  }

  if (!options.credentialsId) {
    return {
      outgoingEdgeId,
      logs: [noCredentialsError],
    };
  }
  const credentials = await prisma.credentials.findUnique({
    where: {
      id: options.credentialsId,
    },
  });
  if (!credentials) {
    console.error("Could not find credentials in database");
    return { outgoingEdgeId, logs: [noCredentialsError] };
  }
  const { apiKey } = (await decrypt(
    credentials.data,
    credentials.iv,
  )) as OpenAICredentials["data"];

  const config = {
    apiKey,
    baseURL: options.baseUrl ?? defaultOpenAIOptions.baseUrl,
    defaultHeaders: {
      "api-key": apiKey,
    },
    defaultQuery: isNotEmpty(options.apiVersion)
      ? {
          "api-version": options.apiVersion,
        }
      : undefined,
  } satisfies ClientOptions;

  const openai = new OpenAI(config);

  const variables = newSessionState.typebotsQueue[0].typebot.variables;
  const saveUrlInVariable = variables.find(
    (v) => v.id === options.saveUrlInVariableId,
  );

  if (!saveUrlInVariable) {
    return {
      outgoingEdgeId,
      logs: [
        {
          status: "error",
          description: "Could not find variable to save URL in",
        },
      ],
    };
  }

  const rawAudio = (await openai.audio.speech.create({
    input: parseVariables(variables)(options.input),
    voice: options.voice,
    model: options.model as "tts-1" | "tts-1-hd",
  })) as any;

  const url = await uploadFileToBucket({
    file: Buffer.from((await rawAudio.arrayBuffer()) as ArrayBuffer),
    key: `tmp/openai/audio/${createId() + createId()}.mp3`,
    mimeType: "audio/mpeg",
  });

  newSessionState = updateVariablesInSession({
    newVariables: [
      {
        ...saveUrlInVariable,
        value: url,
      },
    ],
    state: newSessionState,
    currentBlockId: undefined,
  }).updatedState;

  return {
    startTimeShouldBeUpdated: true,
    outgoingEdgeId,
    newSessionState,
  };
};
