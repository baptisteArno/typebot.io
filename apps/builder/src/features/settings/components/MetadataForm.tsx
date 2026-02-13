import { useTranslate } from "@tolgee/react";
import type { Settings } from "@typebot.io/settings/schemas";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";

type Props = {
  workspaceId: string;
  typebotId: string;
  typebotName: string;
  metadata: Settings["metadata"];
  onMetadataChange: (metadata: Settings["metadata"]) => void;
};

export const MetadataForm = ({ metadata, onMetadataChange }: Props) => {
  const { t } = useTranslate();
  const handleGoogleTagManagerIdChange = (googleTagManagerId: string) =>
    onMetadataChange({ ...metadata, googleTagManagerId });
  const handleHeadCodeChange = (customHeadCode: string) =>
    onMetadataChange({ ...metadata, customHeadCode });
  const handleAllowIndexingChange = (allowIndexing: boolean) =>
    onMetadataChange({ ...metadata, allowIndexing });

  return (
    <div className="flex flex-col gap-6">
      <Field.Root>
        <Field.Label>
          Google Tag Manager ID:
          <MoreInfoTooltip>
            {t("settings.sideMenu.metadata.gtm.tooltip")}
          </MoreInfoTooltip>
        </Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={metadata?.googleTagManagerId}
          placeholder="GTM-XXXXXX"
          onValueChange={handleGoogleTagManagerIdChange}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {t("settings.sideMenu.metadata.headCode.label")}
          <MoreInfoTooltip>
            {t("settings.sideMenu.metadata.headCode.tooltip")}
          </MoreInfoTooltip>
        </Field.Label>
        <CodeEditor
          defaultValue={metadata?.customHeadCode}
          onChange={handleHeadCodeChange}
          lang="html"
          withVariableButton={false}
        />
      </Field.Root>
      <Field.Root className="flex-row items-center">
        <Switch
          checked={metadata?.allowIndexing}
          onCheckedChange={handleAllowIndexingChange}
        />
        <Field.Label>
          {t("settings.sideMenu.metadata.allowIndexing.label")}{" "}
          <MoreInfoTooltip>
            {t("settings.sideMenu.metadata.allowIndexing.tooltip")}
          </MoreInfoTooltip>
        </Field.Label>
      </Field.Root>
    </div>
  );
};
