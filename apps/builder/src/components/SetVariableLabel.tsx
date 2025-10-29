import { useTranslate } from "@tolgee/react";
import { Badge } from "@typebot.io/ui/components/Badge";
import type { Variable } from "@typebot.io/variables/schemas";

export const SetVariableLabel = ({
  variableId,
  variables,
}: {
  variableId: string;
  variables?: Variable[];
}) => {
  const { t } = useTranslate();
  const variableName = variables?.find(
    (variable) => variable.id === variableId,
  )?.name;

  if (!variableName) return null;
  return (
    <div className="flex items-center gap-1 italic">
      <p className="text-sm text-gray-8">{t("variables.set")}</p>
      <Badge colorScheme="purple" className="break-all">
        {variableName}
      </Badge>
    </div>
  );
};
