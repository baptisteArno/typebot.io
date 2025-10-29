import type { ButtonTheme } from "@typebot.io/js";
import { Popover } from "@typebot.io/ui/components/Popover";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { ColorPicker } from "@/components/ColorPicker";
import { ImageUploadContent } from "@/components/ImageUploadContent";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";

type Props = {
  buttonTheme: ButtonTheme | undefined;
  onChange: (newButtonTheme?: ButtonTheme) => void;
};

export const ButtonThemeSettings = ({ buttonTheme, onChange }: Props) => {
  const { workspace } = useWorkspace();
  const { typebot } = useTypebot();
  const customIconPopoverControls = useOpenControls();

  const updateBackgroundColor = (backgroundColor: string) => {
    onChange({
      ...buttonTheme,
      backgroundColor,
    });
  };

  const updateCustomIconSrc = (customIconSrc: string) => {
    onChange({
      ...buttonTheme,
      customIconSrc,
    });
  };

  const updateSize = (size: any) =>
    onChange({
      ...buttonTheme,
      size,
    });

  return (
    <div className="flex flex-col gap-4 border rounded-md p-4">
      <h3>Button</h3>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 justify-between">
          <p>Size</p>
          <BasicSelect
            size="sm"
            items={[
              {
                value: "medium",
                label: "Medium",
              },
              { value: "large", label: "Large" },
            ]}
            value={buttonTheme?.size}
            defaultValue="medium"
            onChange={updateSize}
          />
        </div>
        <div className="flex items-center gap-2 justify-between">
          <p>Color</p>
          <ColorPicker
            defaultValue={buttonTheme?.backgroundColor}
            onColorChange={updateBackgroundColor}
          />
        </div>
        <div className="flex items-center gap-2 justify-between">
          <p>Custom icon</p>
          <Popover.Root {...customIconPopoverControls}>
            <Popover.TriggerButton size="sm" variant="secondary">
              Pick an image
            </Popover.TriggerButton>
            <Popover.Popup className="w-[500px]">
              {workspace?.id && typebot?.id && (
                <ImageUploadContent
                  onSubmit={(url) => {
                    updateCustomIconSrc(url);
                    customIconPopoverControls.onClose();
                  }}
                  uploadFileProps={{
                    workspaceId: workspace.id,
                    typebotId: typebot.id,
                    fileName: "bubble-icon",
                  }}
                />
              )}
            </Popover.Popup>
          </Popover.Root>
        </div>
      </div>
    </div>
  );
};
