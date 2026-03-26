import { DebouncedTextInput } from "@typebot.io/ui/components/DebouncedTextInput";
import { Editable } from "@typebot.io/ui/components/Editable";
import { EmojiOrImageIcon } from "@typebot.io/ui/components/EmojiOrImageIcon";
import { EmojiPicker } from "@typebot.io/ui/components/EmojiPicker";
import { IconPicker } from "@typebot.io/ui/components/IconPicker";
import { Menu } from "@typebot.io/ui/components/Menu";
import { Popover } from "@typebot.io/ui/components/Popover";
import { Table } from "@typebot.io/ui/components/Table";
import { Tabs } from "@typebot.io/ui/components/Tabs";
import { UploadButton } from "@typebot.io/ui/components/UploadButton";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { MoreVerticalIcon } from "@typebot.io/ui/icons/MoreVerticalIcon";
import { useState } from "react";
import type { SpaceListResponse } from "../../application/SpacesUsecases";
import { SpacesIcon } from "./SpacesIcon";

type Props = {
  spaces: SpaceListResponse;
  defaultEditableSpaceId?: string;
  onSpaceUpdate: (space: {
    id: string;
    name: string;
    icon: string | null;
  }) => Promise<void>;
  onSpaceDelete: (spaceId: string) => void;
  onFileUploadRequest: (file: File, spaceId: string) => Promise<string | null>;
};

export const SpacesTable = ({
  spaces,
  defaultEditableSpaceId,
  onSpaceUpdate,
  onSpaceDelete,
  onFileUploadRequest,
}: Props) => (
  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head>Space</Table.Head>
        <Table.Head className="w-10" />
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {spaces.map((space) => (
        <Table.Row key={space.id}>
          <Table.Cell>
            <div className="flex items-center gap-2">
              <SpaceIconPopover
                defaultValue={space.icon}
                onFileUploadRequest={(file) =>
                  onFileUploadRequest(file, space.id)
                }
                onValueCommit={(icon) =>
                  onSpaceUpdate({ id: space.id, name: space.name, icon })
                }
              />
              <Editable.Root
                defaultValue={space.name}
                defaultEdit={defaultEditableSpaceId === space.id}
                onValueCommit={(newName) => {
                  if (newName === space.name) return;
                  onSpaceUpdate({
                    id: space.id,
                    name: newName,
                    icon: space.icon,
                  });
                }}
              >
                <Editable.Preview />
                <Editable.Input />
              </Editable.Root>
            </div>
          </Table.Cell>
          <Table.Cell className="w-10">
            <Menu.Root>
              <Menu.TriggerButton
                aria-label="More options"
                variant="ghost"
                size="icon"
              >
                <MoreVerticalIcon />
              </Menu.TriggerButton>
              <Menu.Popup align="end">
                <Menu.Item
                  className="text-red-10"
                  onClick={() => onSpaceDelete(space.id)}
                >
                  Delete
                </Menu.Item>
              </Menu.Popup>
            </Menu.Root>
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table.Root>
);

type SpaceIconPopoverProps = {
  defaultValue: string | null;
  onFileUploadRequest: (file: File) => Promise<string | null>;
  onValueCommit: (icon: string | null) => void;
};

const SpaceIconPopover = ({
  defaultValue,
  onValueCommit,
  onFileUploadRequest,
}: SpaceIconPopoverProps) => {
  const popoverControls = useOpenControls();
  const [currentTab, setCurrentTab] = useState("icon");

  return (
    <Popover.Root {...popoverControls}>
      <Popover.TriggerButton
        variant="ghost"
        size="icon"
        onClick={popoverControls.onOpen}
      >
        <EmojiOrImageIcon
          icon={defaultValue}
          defaultIcon={<SpacesIcon className="size-full" />}
          className="size-6 justify-center text-xl"
        />
      </Popover.TriggerButton>
      <Popover.Popup>
        <Tabs.Root value={currentTab} onValueChange={setCurrentTab}>
          <Tabs.List>
            <Tabs.Tab value="icon">Icon</Tabs.Tab>
            <Tabs.Tab value="emoji">Emoji</Tabs.Tab>
            <Tabs.Tab value="link">Link</Tabs.Tab>
            <Tabs.Tab value="upload">Upload</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="icon">
            <IconPicker.Root onIconSelected={(icon) => { onValueCommit(icon); popoverControls.onClose(); }}>
              <div className="flex items-center gap-2">
                <IconPicker.SearchInput />
                <IconPicker.ColorPicker />
              </div>
              <IconPicker.List />
            </IconPicker.Root>
          </Tabs.Panel>
          <Tabs.Panel value="emoji">
            <EmojiPicker.Root onEmojiSelected={(emoji) => { onValueCommit(emoji); popoverControls.onClose(); }}>
              <EmojiPicker.SearchInput />
              <EmojiPicker.List />
            </EmojiPicker.Root>
          </Tabs.Panel>
          <Tabs.Panel value="link">
            <DebouncedTextInput
              placeholder="https://example.com/icon.png"
              onValueChange={(value) => onValueCommit(value)}
            />
          </Tabs.Panel>
          <Tabs.Panel value="upload" className="flex justify-center py-4">
            <UploadButton
              accept="image/avif, image/*"
              onFileUploadRequest={onFileUploadRequest}
              onValueCommit={(icon) => { onValueCommit(icon); popoverControls.onClose(); }}
            />
          </Tabs.Panel>
        </Tabs.Root>
      </Popover.Popup>
    </Popover.Root>
  );
};
