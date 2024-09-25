import { safeStringify } from "@/features/variables";
import { isDefined } from "@typebot.io/lib/utils";
import type { AnswerInput } from "@typebot.io/results/schemas/answers";
import type { ResultValuesInput } from "@typebot.io/results/schemas/results";
import type {
  Variable,
  VariableWithUnknowValue,
  VariableWithValue,
} from "@typebot.io/variables/schemas";
import { type ReactNode, createContext, useContext, useState } from "react";

const answersContext = createContext<{
  resultId?: string;
  resultValues: ResultValuesInput;
  addAnswer: (
    existingVariables: Variable[],
  ) => (
    answer: AnswerInput & { uploadedFiles: boolean },
  ) => Promise<void> | undefined;
  updateVariables: (variables: VariableWithUnknowValue[]) => void;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({});

export const AnswersProvider = ({
  children,
  resultId,
  onNewAnswer,
  onVariablesUpdated,
}: {
  resultId?: string;
  onNewAnswer: (
    answer: AnswerInput & { uploadedFiles: boolean },
  ) => Promise<void> | undefined;
  onVariablesUpdated?: (variables: VariableWithValue[]) => void;
  children: ReactNode;
}) => {
  const [resultValues, setResultValues] = useState<ResultValuesInput>({
    answers: [],
    variables: [],
    createdAt: new Date(),
  });

  const addAnswer =
    (existingVariables: Variable[]) =>
    (answer: AnswerInput & { uploadedFiles: boolean }) => {
      if (answer.variableId)
        updateVariables([
          {
            id: answer.variableId,
            value: answer.content,
            name:
              existingVariables.find(
                (existingVariable) => existingVariable.id === answer.variableId,
              )?.name ?? "",
          },
        ]);
      setResultValues((resultValues) => ({
        ...resultValues,
        answers: [...resultValues.answers, answer],
      }));
      return onNewAnswer && onNewAnswer(answer);
    };

  const updateVariables = (newVariables: VariableWithUnknowValue[]) => {
    const serializedNewVariables = newVariables.map((variable) => ({
      ...variable,
      value: safeStringify(variable.value),
    }));

    setResultValues((resultValues) => {
      const updatedVariables = [
        ...resultValues.variables.filter((v) =>
          serializedNewVariables.every(
            (variable) => variable.id !== v.id || variable.name !== v.name,
          ),
        ),
        ...serializedNewVariables,
      ].filter((variable) => isDefined(variable.value)) as VariableWithValue[];
      if (onVariablesUpdated) onVariablesUpdated(updatedVariables);
      return {
        ...resultValues,
        variables: updatedVariables,
      };
    });
  };

  return (
    <answersContext.Provider
      value={{
        resultId,
        resultValues,
        addAnswer,
        updateVariables,
      }}
    >
      {children}
    </answersContext.Provider>
  );
};

export const useAnswers = () => useContext(answersContext);
