import prisma from "@typebot.io/prisma";
import {
  assertProductionEnvironment,
  getRequiredInput,
  runScript,
} from "./cli";

const searchResult = async () => {
  assertProductionEnvironment();

  const typebotId = await getRequiredInput({
    message: "Typebot ID?",
    name: "typebot-id",
  });
  const variableId = await getRequiredInput({
    message: "Variable ID?",
    name: "variable-id",
  });
  const variableName = await getRequiredInput({
    message: "Variable name?",
    name: "variable-name",
  });
  const variableValue = await getRequiredInput({
    message: "Variable value?",
    name: "variable-value",
  });

  const result = await prisma.result.findFirst({
    where: {
      typebotId,
      hasStarted: true,
      variables: {
        array_contains: {
          id: variableId,
          name: variableName,
          value: variableValue,
          isSessionVariable: false,
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (!result) {
    console.log("Result not found");
    return;
  }

  console.log(result);
};

runScript(searchResult);
