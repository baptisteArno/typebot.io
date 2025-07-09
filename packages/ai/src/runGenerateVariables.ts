import type { LogsStore, VariableStore } from "@typebot.io/forge/types";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { isNotEmpty } from "@typebot.io/lib/utils";
import type { Variable } from "@typebot.io/variables/schemas";
import { z } from "@typebot.io/zod";
import { type LanguageModel, generateObject } from "ai";
import type {
  GenerateVariablesOptions,
  variablesToExtractSchema,
} from "./parseGenerateVariablesOptions";

type Props = {
  model: LanguageModel;
  variables: VariableStore;
  logs: LogsStore;
} & Pick<GenerateVariablesOptions, "variablesToExtract" | "prompt">;

export const runGenerateVariables = async ({
  variablesToExtract,
  model,
  prompt,
  variables: variablesStore,
  logs,
}: Props) => {
  if (!prompt) return logs.add("No prompt provided");
  const variables = variablesStore.list();

  const schema = convertVariablesToExtractToSchema({
    variablesToExtract,
    variables,
  });
  if (!schema) {
    logs.add("Could not parse variables to extract");
    return;
  }

  const hasOptionalVariables = variablesToExtract?.some(
    (variableToExtract) => variableToExtract.isRequired === false,
  );

  try {
    const { object } = await generateObject({
      model,
      schema,
      prompt:
        `${prompt}\n\nYou should generate a JSON object` +
        (hasOptionalVariables
          ? " and provide empty values if the information is not there or if you are unsure."
          : "."),
    });
    Object.entries(object).forEach(([key, value]) => {
      if (value === null) return;
      const existingVariable = variables.find((v) => v.name === key);
      if (!existingVariable) return;
      variablesStore.set([{ id: existingVariable.id, value }]);
    });
  } catch (error) {
    logs.add(await parseUnknownError({ err: error }));
  }
};

const convertVariablesToExtractToSchema = ({
  variablesToExtract,
  variables,
}: {
  variablesToExtract: z.infer<typeof variablesToExtractSchema> | undefined;
  variables: Variable[];
}): z.ZodTypeAny | undefined => {
  if (!variablesToExtract || variablesToExtract?.length === 0) return;

  const shape: z.ZodRawShape = {};
  variablesToExtract.forEach((variableToExtract) => {
    if (!variableToExtract) return;
    const matchingVariable = variables.find(
      (v) => v.id === variableToExtract.variableId,
    );
    if (!matchingVariable) return;
    switch (variableToExtract.type) {
      case "string":
        shape[matchingVariable.name] = z.string();
        break;
      case "number":
        shape[matchingVariable.name] = z.number();
        break;
      case "boolean":
        shape[matchingVariable.name] = z.boolean();
        break;
      case "array":
        shape[matchingVariable.name] = z.array(z.string());
        break;
      case "enum": {
        if (!variableToExtract.values || variableToExtract.values.length === 0)
          return;
        shape[matchingVariable.name] = z.enum(variableToExtract.values as any);
        break;
      }
    }
    if (variableToExtract.isRequired === false)
      shape[matchingVariable.name] = shape[matchingVariable.name]!.nullish();

    if (isNotEmpty(variableToExtract.description))
      shape[matchingVariable.name] = shape[matchingVariable.name]!.describe(
        variableToExtract.description,
      );
  });

  return z.object(shape);
};
