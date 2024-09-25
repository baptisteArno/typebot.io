/* eslint-disable @typescript-eslint/no-explicit-any */
import { DropdownList } from "@/components/DropdownList";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { isDefined } from "@typebot.io/lib/utils";
import type { z } from "@typebot.io/zod";
import { useMemo } from "react";
import { ZodObjectLayout } from "./ZodObjectLayout";

type Props = {
  blockDef?: ForgedBlockDefinition;
  blockOptions?: ForgedBlock["options"];
  schema: z.ZodOptional<z.ZodDiscriminatedUnion<"action", z.ZodObject<any>[]>>;
  onDataChange: (options: ForgedBlock["options"]) => void;
};

export const ZodActionDiscriminatedUnion = ({
  blockDef,
  blockOptions,
  schema,
  onDataChange,
}: Props) => {
  const innerSchema = schema._def.innerType;
  const currentOptions = blockOptions?.action
    ? innerSchema._def.optionsMap.get(blockOptions?.action)
    : undefined;
  const keysBeforeActionField = useMemo(() => {
    if (!currentOptions) return [];
    return Object.keys(currentOptions.shape).slice(
      0,
      Object.keys(currentOptions.shape).findIndex((key) => key === "action") +
        1,
    );
  }, [currentOptions]);
  return (
    <>
      <DropdownList
        currentItem={blockOptions?.action}
        onItemSelect={(item) => onDataChange({ ...blockOptions, action: item })}
        items={
          [...innerSchema._def.optionsMap.keys()].filter(isDefined) as string[]
        }
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
