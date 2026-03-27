import { Editable } from "@typebot.io/ui/components/Editable";
import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";

type EditableUrlProps = {
  hostname: string;
  pathname?: string;
  isValid: (newPathname: string) => Promise<boolean> | boolean;
  onPathnameChange: (pathname: string) => void;
};

export const EditableUrl = ({
  hostname,
  pathname,
  isValid,
  onPathnameChange,
}: EditableUrlProps) => {
  const [value, setValue] = useState(pathname);

  const handleSubmit = async (newPathname: string) => {
    if (newPathname === pathname) return;
    if (await isValid(newPathname)) return onPathnameChange(newPathname);
    setValue(pathname);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <p className="shrink-0">{hostname}/</p>
        <Editable.Root
          value={value}
          className="font-medium max-w-xs"
          onValueChange={setValue}
          onValueCommit={handleSubmit}
        >
          <Editable.Input className="px-2" />
          <Editable.Preview className="border-gray-7 cursor-text px-2" />
        </Editable.Root>
      </div>
      <CopyButton textToCopy={`${hostname}/${value ?? ""}`} />
    </div>
  );
};
