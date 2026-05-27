import { isNotEmpty } from "@typebot.io/lib/utils";
import type { Responses } from "openai/resources/responses/responses";
import { z } from "zod";

type FunctionDef = {
  name?: string;
  description?: string;
  parameters?: Array<{
    type?: "string" | "number" | "boolean" | "enum";
    name?: string;
    description?: string;
    required?: boolean;
    values?: (string | undefined)[];
  }>;
  code?: string;
};

export const parseToolsForResponsesApi = ({
  functions,
  fileSearchVectorStoreIds,
  fileSearchMaxNumResults,
  fileSearchScoreThreshold,
  webSearchEnabled,
  codeInterpreterEnabled,
}: {
  functions?: FunctionDef[];
  fileSearchVectorStoreIds?: string[];
  fileSearchMaxNumResults?: number | string;
  fileSearchScoreThreshold?: number | string;
  webSearchEnabled?: boolean;
  codeInterpreterEnabled?: boolean;
}): Responses.Tool[] => {
  const tools: Responses.Tool[] = [];

  if (fileSearchVectorStoreIds) {
    const ids = fileSearchVectorStoreIds.filter(isNotEmpty);
    if (ids.length > 0)
      tools.push({
        type: "file_search",
        vector_store_ids: ids,
        max_num_results: parseFileSearchMaxNumResults(fileSearchMaxNumResults),
        ranking_options: parseFileSearchRankingOptions(
          fileSearchScoreThreshold,
        ),
      });
  }

  if (webSearchEnabled) tools.push({ type: "web_search" });

  if (codeInterpreterEnabled)
    tools.push({ type: "code_interpreter", container: { type: "auto" } });

  if (functions) {
    for (const fn of functions) {
      if (!fn.name || !fn.code) continue;
      tools.push({
        type: "function",
        name: fn.name,
        description: fn.description ?? "",
        parameters: parseParametersToJsonSchema(fn.parameters),
        strict: false,
      });
    }
  }

  return tools;
};

const parseFileSearchMaxNumResults = (
  fileSearchMaxNumResults?: number | string,
): number | undefined => {
  const parsedFileSearchMaxNumResults = parseNumberOption(
    fileSearchMaxNumResults,
  );
  if (parsedFileSearchMaxNumResults == null) return;
  if (!Number.isInteger(parsedFileSearchMaxNumResults)) return;
  if (parsedFileSearchMaxNumResults < 1 || parsedFileSearchMaxNumResults > 50)
    return;

  return parsedFileSearchMaxNumResults;
};

const parseFileSearchRankingOptions = (
  fileSearchScoreThreshold?: number | string,
): Responses.FileSearchTool.RankingOptions | undefined => {
  const parsedFileSearchScoreThreshold = parseNumberOption(
    fileSearchScoreThreshold,
  );
  if (parsedFileSearchScoreThreshold == null) return;
  if (parsedFileSearchScoreThreshold < 0 || parsedFileSearchScoreThreshold > 1)
    return;

  return {
    ranker: "auto",
    score_threshold: parsedFileSearchScoreThreshold,
  };
};

const parseNumberOption = (value?: number | string): number | undefined => {
  if (typeof value === "number")
    return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string") return;

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) return;

  const parsedValue = Number(trimmedValue);
  if (!Number.isFinite(parsedValue)) return;

  return parsedValue;
};

const parseParametersToJsonSchema = (
  parameters: FunctionDef["parameters"],
): Record<string, unknown> => {
  if (!parameters || parameters.length === 0)
    return { type: "object", properties: {} };

  const shape: Record<string, z.ZodTypeAny> = {};
  for (const param of parameters) {
    if (!param.name) continue;
    switch (param.type) {
      case "string":
        shape[param.name] = z.string();
        break;
      case "number":
        shape[param.name] = z.number();
        break;
      case "boolean":
        shape[param.name] = z.boolean();
        break;
      case "enum": {
        const values = (param.values ?? []).filter(
          (v): v is string => v !== undefined,
        );
        if (values.length === 0) continue;
        shape[param.name] = z.enum(values as [string, ...string[]]);
        break;
      }
    }
    if (param.description && isNotEmpty(param.description))
      shape[param.name] = shape[param.name]!.describe(param.description);
    if (param.required === false)
      shape[param.name] = shape[param.name]!.optional();
  }

  return z.object(shape).toJSONSchema({ target: "draft-07" }) as Record<
    string,
    unknown
  >;
};
