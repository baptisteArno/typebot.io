import { useTranslate } from "@tolgee/react";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { useState } from "react";
import { SingleLineEditable } from "@/components/SingleLineEditable";

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
          <SingleLineEditable
            className="text-sm"
            value={currentName}
            onValueCommit={submitNewName}
            input={{
              onValueChange: setCurrentName,
            }}
          />
        }
      />
      <Tooltip.Popup>{t("rename")}</Tooltip.Popup>
    </Tooltip.Root>
  );
};
