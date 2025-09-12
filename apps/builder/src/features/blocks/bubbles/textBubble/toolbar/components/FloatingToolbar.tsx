import { KEYS } from "@typebot.io/rich-text/plate";
import {
  type FloatingToolbarState,
  flip,
  offset,
  useFloatingToolbar,
  useFloatingToolbarState,
} from "@typebot.io/rich-text/plate/floating";
import {
  useComposedRef,
  useEditorId,
  useEventEditorValue,
  useMarkToolbarButton,
  useMarkToolbarButtonState,
  usePluginOption,
} from "@typebot.io/rich-text/plate/react";
import type { ButtonProps } from "@typebot.io/ui/components/Button";
import {
  Toolbar,
  type ToolbarRootProps,
} from "@typebot.io/ui/components/Toolbar";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { TextBoldIcon } from "@typebot.io/ui/icons/TextBoldIcon";
import { TextItalicIcon } from "@typebot.io/ui/icons/TextItalicIcon";
import { TextUnderlineIcon } from "@typebot.io/ui/icons/TextUnderlineIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { forwardRef } from "react";
import { LinkToolbarButton } from "../../link/components/LinkToolbarButton";

export function FloatingToolbar({
  children,
  className,
  state,
  ...props
}: ToolbarRootProps & {
  state?: FloatingToolbarState;
}) {
  const editorId = useEditorId();
  const focusedEditorId = useEventEditorValue("focus");
  const isFloatingLinkOpen = !!usePluginOption({ key: KEYS.link }, "mode");

  const floatingToolbarState = useFloatingToolbarState({
    editorId,
    focusedEditorId,
    hideToolbar: isFloatingLinkOpen,
    ...state,
    floatingOptions: {
      middleware: [
        offset(6),
        flip({
          fallbackPlacements: [
            "top-start",
            "top-end",
            "bottom-start",
            "bottom-end",
          ],
          padding: 12,
        }),
      ],
      placement: "top",
      ...state?.floatingOptions,
    },
  });

  const {
    clickOutsideRef,
    hidden,
    props: rootProps,
    ref: floatingRef,
  } = useFloatingToolbar(floatingToolbarState);

  const ref = useComposedRef<HTMLDivElement>(floatingRef, clickOutsideRef);

  if (hidden) return null;

  return (
    <Toolbar.Root
      {...props}
      {...rootProps}
      ref={ref}
      className={cn("absolute z-50 shadow-md max-w-[80vw]", className)}
    >
      <Toolbar.Group aria-label="Text formatting">
        <Tooltip.Root>
          <Tooltip.Trigger
            render={(props) => (
              <MarkToolbarButton nodeType={KEYS.bold} {...props}>
                <TextBoldIcon />
              </MarkToolbarButton>
            )}
          />
          <Tooltip.Popup>Bold (⌘+B)</Tooltip.Popup>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger
            render={(props) => (
              <MarkToolbarButton nodeType={KEYS.italic} {...props}>
                <TextItalicIcon />
              </MarkToolbarButton>
            )}
          />
          <Tooltip.Popup>Italic (⌘+I)</Tooltip.Popup>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger
            render={(props) => (
              <MarkToolbarButton nodeType={KEYS.underline} {...props}>
                <TextUnderlineIcon />
              </MarkToolbarButton>
            )}
          />
          <Tooltip.Popup>Underline (⌘+U)</Tooltip.Popup>
        </Tooltip.Root>
      </Toolbar.Group>
      <Toolbar.Separator />
      <LinkToolbarButton />
    </Toolbar.Root>
  );
}

const MarkToolbarButton = forwardRef<
  HTMLButtonElement,
  {
    nodeType: string;
    clear?: string | string[];
  } & ButtonProps
>(({ clear, nodeType, children, ...props }, ref) => {
  const state = useMarkToolbarButtonState({ clear, nodeType });
  const { props: stateProps } = useMarkToolbarButton(state);

  return (
    <Toolbar.Button
      {...props}
      ref={ref}
      data-pressed={stateProps.pressed ? "" : undefined}
      {...stateProps}
    >
      {children}
    </Toolbar.Button>
  );
});
