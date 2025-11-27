import { KEYS, type TLinkElement } from "@typebot.io/rich-text/plate";
import {
  flip,
  offset,
  type UseVirtualFloatingOptions,
} from "@typebot.io/rich-text/plate/floating";
import {
  type LinkFloatingToolbarState,
  LinkPlugin,
  useFloatingLinkEdit,
  useFloatingLinkEditState,
  useFloatingLinkInsert,
  useFloatingLinkInsertState,
} from "@typebot.io/rich-text/plate/link/react";
import {
  useEditorPlugin,
  useEditorRef,
  useEditorSelection,
  useFormInputProps,
} from "@typebot.io/rich-text/plate/react";
import {
  Button,
  type ButtonProps,
  buttonVariants,
} from "@typebot.io/ui/components/Button";
import { Input } from "@typebot.io/ui/components/Input";
import { Separator } from "@typebot.io/ui/components/Separator";
import { Link02Icon } from "@typebot.io/ui/icons/Link02Icon";
import { LinkSquare02Icon } from "@typebot.io/ui/icons/LinkSquare02Icon";
import { TextIcon } from "@typebot.io/ui/icons/TextIcon";
import { UnlinkIcon } from "@typebot.io/ui/icons/UnlinkIcon";
import { type InputHTMLAttributes, useCallback, useMemo } from "react";

const popoverClassNames =
  "z-50 w-auto rounded-md border bg-gray-1 shadow-md outline-hidden";

export const LinkFloatingToolbar = ({
  state,
}: {
  state?: LinkFloatingToolbarState;
}) => {
  const floatingOptions: UseVirtualFloatingOptions = useMemo(() => {
    return {
      middleware: [
        offset(8),
        flip({
          fallbackPlacements: ["bottom-end", "top-start", "top-end"],
          padding: 12,
        }),
      ],
      placement: "bottom-start",
    };
  }, []);

  const insertState = useFloatingLinkInsertState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  });
  const {
    hidden,
    props: insertProps,
    ref: insertRef,
    textInputProps,
  } = useFloatingLinkInsert(insertState);

  const editState = useFloatingLinkEditState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  });
  const {
    editButtonProps,
    props: editProps,
    ref: editRef,
    unlinkButtonProps,
  } = useFloatingLinkEdit(editState);
  const inputProps = useFormInputProps({
    preventDefaultOnEnterKeydown: false,
  });

  if (hidden) return null;

  return (
    <>
      <div
        ref={insertRef}
        className={popoverClassNames}
        {...insertProps}
        style={insertProps.style as React.CSSProperties}
      >
        <LinkForm
          onKeyDownCapture={inputProps.props.onKeyDownCapture}
          textInputProps={textInputProps}
        />
      </div>

      <div
        ref={editRef}
        className={popoverClassNames}
        {...editProps}
        style={editProps.style as React.CSSProperties}
      >
        {editState.isEditing ? (
          <LinkForm
            onKeyDownCapture={inputProps.props.onKeyDownCapture}
            textInputProps={textInputProps}
          />
        ) : (
          <LinkMenu
            editButtonProps={editButtonProps}
            unlinkButtonProps={unlinkButtonProps}
          />
        )}
      </div>
    </>
  );
};

const LinkMenu = ({
  editButtonProps,
  unlinkButtonProps,
}: {
  editButtonProps: ButtonProps;
  unlinkButtonProps: ButtonProps;
}) => {
  return (
    <div className="box-content flex items-center">
      <Button size="sm" variant="ghost" {...editButtonProps}>
        Edit link
      </Button>

      <Separator orientation="vertical" />

      <OpenLinkButton />

      <Separator orientation="vertical" />

      <Button size="icon" variant="ghost" {...unlinkButtonProps}>
        <UnlinkIcon />
      </Button>
    </div>
  );
};

const LinkForm = ({
  onKeyDownCapture,
  textInputProps,
}: {
  onKeyDownCapture:
    | ((e: React.KeyboardEvent<HTMLDivElement>) => void)
    | undefined;
  textInputProps: InputHTMLAttributes<HTMLInputElement>;
}) => {
  return (
    <div
      className="flex w-[330px] flex-col gap-2 p-2"
      onKeyDownCapture={onKeyDownCapture}
    >
      <div className="flex items-center gap-2">
        <TextIcon className="size-4" />
        <Input
          {...textInputProps}
          size="sm"
          placeholder="Text to display"
          data-plate-focus
        />
      </div>
      <Separator className="mx-4" />
      <div className="flex items-center gap-2">
        <Link02Icon className="size-4" />
        <FloatingLinkUrlInput />
      </div>
    </div>
  );
};

// Can't use plate default input because it encodes the url on input change. Which we don't want for variables.
const FloatingLinkUrlInput = () => {
  const { getOptions, setOption } = useEditorPlugin(LinkPlugin);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setOption("url", e.target.value);
    },
    [setOption],
  );

  return (
    <Input
      size="sm"
      placeholder="Paste link"
      data-plate-focus
      onChange={onChange}
      defaultValue={getOptions().url}
    />
  );
};

const OpenLinkButton = () => {
  const editor = useEditorRef();
  const selection = useEditorSelection();

  const href = useMemo(() => {
    const entry = editor.api.node<TLinkElement>({
      match: { type: editor.getType(KEYS.link) },
    });
    if (!entry) return;
    try {
      return new URL(entry[0].url).href;
    } catch {
      return;
    }
  }, [editor, selection]);

  return (
    <a
      href={href}
      className={buttonVariants({
        size: "icon",
        variant: "ghost",
      })}
      aria-label="Open link in a new tab"
      target="_blank"
      rel="noreferrer"
    >
      <LinkSquare02Icon />
    </a>
  );
};
