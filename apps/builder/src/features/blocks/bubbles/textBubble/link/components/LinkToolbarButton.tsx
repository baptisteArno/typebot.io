import {
  useLinkToolbarButton,
  useLinkToolbarButtonState,
} from "@typebot.io/rich-text/plate/link/react";
import { Toolbar } from "@typebot.io/ui/components/Toolbar";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { LinkIcon } from "@typebot.io/ui/icons/LinkIcon";

export const LinkToolbarButton = () => {
  const state = useLinkToolbarButtonState();
  const { props: buttonProps } = useLinkToolbarButton(state);

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={(props) => (
          <Toolbar.Button {...props} {...buttonProps} data-plate-focus>
            <LinkIcon />
          </Toolbar.Button>
        )}
      />
      <Tooltip.Popup>Link</Tooltip.Popup>
    </Tooltip.Root>
  );
};
