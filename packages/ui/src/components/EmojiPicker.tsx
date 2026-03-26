import emojiTagsData from "emojilib";
import { createContext, use, useMemo, useRef, useState } from "react";
import { Button } from "./Button";
import emojis from "./emoji/emojiList.json";
import { Input } from "./Input";

const emojiTags = emojiTagsData as Record<string, string[]>;

const emojiGroups = [
  {
    label: "PEOPLE",
    emojis: emojis["Smileys & Emotion"].concat(emojis["People & Body"]),
  },
  { label: "ANIMALS & NATURE", emojis: emojis["Animals & Nature"] },
  { label: "FOOD & DRINK", emojis: emojis["Food & Drink"] },
  { label: "TRAVEL & PLACES", emojis: emojis["Travel & Places"] },
  { label: "ACTIVITIES", emojis: emojis.Activities },
  { label: "OBJECTS", emojis: emojis.Objects },
  { label: "SYMBOLS", emojis: emojis.Symbols },
  { label: "FLAGS", emojis: emojis.Flags },
] as const;

const localStorageRecentEmojisKey = "recentEmojis";

type EmojiPickerContextValue = {
  searchQuery: string;
  recentEmojis: string[];
  searchEmoji: (query: string) => void;
  selectEmoji: (emoji: string) => void;
};

const EmojiPickerContext = createContext<EmojiPickerContextValue | null>(null);

const useEmojiPickerContext = () => {
  const ctx = use(EmojiPickerContext);
  if (!ctx)
    throw new Error(
      "EmojiPicker components must be used within EmojiPicker.Root",
    );
  return ctx;
};

type RootProps = {
  children: React.ReactNode;
  onEmojiSelected: (emoji: string) => void;
};

const Root = ({ children, onEmojiSelected }: RootProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(localStorageRecentEmojisKey);
    return stored ? JSON.parse(stored) : [];
  });

  const selectEmoji = (emoji: string) => {
    const updated = [...new Set([emoji, ...recentEmojis].slice(0, 30))];
    localStorage.setItem(localStorageRecentEmojisKey, JSON.stringify(updated));
    setRecentEmojis(updated);
    onEmojiSelected(emoji);
  };

  return (
    <EmojiPickerContext
      value={{
        searchQuery,
        recentEmojis,
        searchEmoji: setSearchQuery,
        selectEmoji,
      }}
    >
      {children}
    </EmojiPickerContext>
  );
};

const SearchInput = ({
  placeholder = "Search...",
  debounceTimeout = 300,
}: {
  placeholder?: string;
  debounceTimeout?: number;
}) => {
  const { searchEmoji } = useEmojiPickerContext();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = (value: string) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => searchEmoji(value), debounceTimeout);
  };

  return <Input placeholder={placeholder} onValueChange={handleChange} />;
};

const List = () => {
  const { searchQuery, recentEmojis, selectEmoji } = useEmojiPickerContext();

  const filteredGroups = useMemo(
    () =>
      emojiGroups.map((group) => ({
        label: group.label,
        emojis: group.emojis.filter((emoji) =>
          emojiTags[emoji]?.find((tag) => tag.includes(searchQuery)),
        ),
      })),
    [searchQuery],
  );

  return (
    <div className="flex flex-col overflow-y-auto max-h-87.5 gap-4 pt-2">
      {recentEmojis.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium pl-2 text-muted-foreground">
            RECENT
          </p>
          <EmojiGrid emojis={recentEmojis} onEmojiClick={selectEmoji} />
        </div>
      )}
      {filteredGroups.map(
        (group) =>
          group.emojis.length > 0 && (
            <div key={group.label} className="flex flex-col gap-2">
              <p className="text-xs font-medium pl-2 text-muted-foreground">
                {group.label}
              </p>
              <EmojiGrid emojis={group.emojis} onEmojiClick={selectEmoji} />
            </div>
          ),
      )}
    </div>
  );
};

const EmojiGrid = ({
  emojis: emojiList,
  onEmojiClick,
}: {
  emojis: string[];
  onEmojiClick: (emoji: string) => void;
}) => (
  <div className="grid gap-0 rounded-md grid-cols-[repeat(auto-fill,minmax(32px,1fr))]">
    {emojiList.map((emoji) => (
      <Button
        onClick={() => onEmojiClick(emoji)}
        variant="ghost"
        size="sm"
        className="text-2xl"
        key={emoji}
      >
        {emoji}
      </Button>
    ))}
  </div>
);

export const EmojiPicker = {
  Root,
  SearchInput,
  List,
};
