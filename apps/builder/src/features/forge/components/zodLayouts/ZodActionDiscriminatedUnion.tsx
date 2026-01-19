import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { isDefined } from "@typebot.io/lib/utils";
import { useMemo } from "react";
import { z } from "zod";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { getDiscriminatedUnionOptionsMap } from "./getDiscriminatedUnionOptionsMap";
import { ZodObjectLayout } from "./ZodObjectLayout";

type Props = {
  blockDef?: ForgedBlockDefinition;
  blockOptions?: ForgedBlock["options"];
  schema: z.ZodOptional<
    z.ZodDiscriminatedUnion<readonly z.ZodObject<any>[], string>
  >;
  onDataChange: (options: ForgedBlock["options"]) => void;
};

export const ZodActionDiscriminatedUnion = ({
  blockDef,
  blockOptions,
  schema,
  onDataChange,
}: Props) => {
  const innerSchema = schema.unwrap();
  if (!isZodDiscriminatedUnion(innerSchema)) return null;
  const optionsMap = getDiscriminatedUnionOptionsMap(innerSchema);
  const currentOptions = blockOptions?.action
    ? optionsMap.get(blockOptions?.action)
    : undefined;
  const keysBeforeActionField = useMemo(() => {
    if (!currentOptions) return [];
    return Object.keys(currentOptions.shape).slice(
      0,
      Object.keys(currentOptions.shape).indexOf("action") + 1,
    );
  }, [currentOptions]);
  return (
    <>
      <BasicSelect
        value={blockOptions?.action}
        onChange={(item) => onDataChange({ ...blockOptions, action: item })}
        items={[...optionsMap.keys()].filter(isDefined)}
        placeholder="Select an action"
      />
      {currentOptions && (
        <ZodObjectLayout
          schema={currentOptions}
          data={blockOptions}
          blockDef={blockDef}
          blockOptions={blockOptions}
          onDataChange={onDataChange}
          ignoreKeys={keysBeforeActionField}
        />
      )}
    </>
  );
};

const isZodDiscriminatedUnion = (
  schema: z.ZodTypeAny,
): schema is z.ZodDiscriminatedUnion<readonly z.ZodObject<any>[], string> =>
  schema instanceof z.ZodDiscriminatedUnion;
