import { EmojiPicker } from "@typebot.io/ui/components/EmojiPicker";

export const EmojiSearchableList = ({
  onEmojiSelected,
}: {
  onEmojiSelected: (emoji: string) => void;
}) => (
  <EmojiPicker.Root onEmojiSelected={onEmojiSelected}>
    <EmojiPicker.SearchInput />
    <EmojiPicker.List />
  </EmojiPicker.Root>
);
