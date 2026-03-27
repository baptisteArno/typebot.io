import { useTranslate } from "@tolgee/react";
import { Editable } from "@typebot.io/ui/components/Editable";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { useState } from "react";

type EditableProps = {
  defaultName: string;
  onNewName: (newName: string) => void;
};
export const EditableTypebotName = ({
  defaultName,
  onNewName,
}: EditableProps) => {
  const { t } = useTranslate();
  const [currentName, setCurrentName] = useState(defaultName);

  const submitNewName = (newName: string) => {
    if (newName === "") return setCurrentName(defaultName);
    if (newName === defaultName) return;
    onNewName(newName);
  };

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Editable.Root
            className="text-sm max-w-[232px]"
            value={currentName}
            onValueChange={setCurrentName}
            onValueCommit={submitNewName}
          >
            <Editable.Input />
            <Editable.Preview />
          </Editable.Root>
        }
      />
      <Tooltip.Popup>{t("rename")}</Tooltip.Popup>
    </Tooltip.Root>
  );
};
