import { Text } from "@chakra-ui/react";
import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { SingleLineEditable } from "@/components/SingleLineEditable";

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
        <Text flexShrink={0}>{hostname}/</Text>
        <SingleLineEditable
          value={value}
          className="font-medium"
          common={{
            className: "px-2",
          }}
          input={{
            onValueChange: setValue,
          }}
          preview={{
            className: "border-gray-7 cursor-text",
          }}
          onValueCommit={handleSubmit}
        />
      </div>
      <CopyButton textToCopy={`${hostname}/${value ?? ""}`} />
    </div>
  );
};
