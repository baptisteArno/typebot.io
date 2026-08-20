import { safeFetch } from "@typebot.io/lib/safeFetch";
import OpenAI, { type ClientOptions } from "openai";

export const createSafeOpenAIClient = (options: ClientOptions) =>
  new OpenAI({
    ...options,
    fetch: safeFetch,
  });
