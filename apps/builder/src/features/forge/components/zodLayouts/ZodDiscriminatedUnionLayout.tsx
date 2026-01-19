import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { isDefined } from "@typebot.io/lib/utils";
import type { z } from "zod";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { getDiscriminatedUnionOptionsMap } from "./getDiscriminatedUnionOptionsMap";
import { ZodObjectLayout } from "./ZodObjectLayout";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const ZodDiscriminatedUnionLayout = ({
  discriminant,
  data,
  schema,
  dropdownPlaceholder,
  blockDef,
  blockOptions,
  onDataChange,
}: {
  discriminant: string;
  data: any;
  schema: z.ZodDiscriminatedUnion<readonly z.ZodObject<any>[], string>;
  dropdownPlaceholder: string;
  blockDef?: ForgedBlockDefinition;
  blockOptions?: ForgedBlock["options"];
  onDataChange: (value: string) => void;
}) => {
  const optionsMap = getDiscriminatedUnionOptionsMap(schema);
  const currentOptions = data?.[discriminant]
    ? optionsMap.get(data?.[discriminant])
    : undefined;
  return (
    <>
      <BasicSelect
        value={data?.[discriminant]}
        onChange={(item) => onDataChange({ ...data, [discriminant]: item })}
        items={[...optionsMap.keys()].filter((key) => isDefined(key))}
        placeholder={dropdownPlaceholder}
      />
      {currentOptions && (
        <ZodObjectLayout
          schema={currentOptions}
          data={data}
          blockDef={blockDef}
          blockOptions={blockOptions}
          onDataChange={onDataChange}
        />
      )}
    </>
  );
};
