import emojiTagsData from "emojilib";
import { useMemo } from "react";
import { Button } from "./Button";
import emojis from "./emoji/emojiList.json";

const emojiTags = emojiTagsData as Record<string, string[]>;

const people = emojis["Smileys & Emotion"].concat(emojis["People & Body"]);
const nature = emojis["Animals & Nature"];
const food = emojis["Food & Drink"];
const activities = emojis.Activities;
const travel = emojis["Travel & Places"];
const objects = emojis.Objects;
const symbols = emojis.Symbols;
const flags = emojis.Flags;

export const EmojisList = ({
  searchQuery,
  recentEmojis,
  onEmojiClick,
}: {
  searchQuery: string;
  recentEmojis?: string[];
  onEmojiClick: (emoji: string) => void;
}) => {
  const filteredGroups = useMemo(() => {
    const byTag = (emoji: string) =>
      emojiTags[emoji].find((tag) => tag.includes(searchQuery));
    return {
      people: people.filter(byTag),
      animals: nature.filter(byTag),
      food: food.filter(byTag),
      travel: travel.filter(byTag),
      activities: activities.filter(byTag),
      objects: objects.filter(byTag),
      symbols: symbols.filter(byTag),
      flags: flags.filter(byTag),
    };
  }, [searchQuery]);

  return (
    <div className="flex flex-col overflow-y-auto max-h-[350px] gap-4">
      {recentEmojis && recentEmojis.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium pl-2 text-muted-foreground">
            RECENT
          </p>
          <EmojiGrid emojis={recentEmojis} onEmojiClick={onEmojiClick} />
        </div>
      )}
      {filteredGroups.people.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium pl-2 text-muted-foreground">
            PEOPLE
          </p>
          <EmojiGrid
            emojis={filteredGroups.people}
            onEmojiClick={onEmojiClick}
          />
        </div>
      )}
      {filteredGroups.animals.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium pl-2 text-muted-foreground">
            ANIMALS & NATURE
          </p>
          <EmojiGrid
            emojis={filteredGroups.animals}
            onEmojiClick={onEmojiClick}
          />
        </div>
      )}
      {filteredGroups.food.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium pl-2 text-muted-foreground">
            FOOD & DRINK
          </p>
          <EmojiGrid emojis={filteredGroups.food} onEmojiClick={onEmojiClick} />
        </div>
      )}
      {filteredGroups.travel.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium pl-2 text-muted-foreground">
            TRAVEL & PLACES
          </p>
          <EmojiGrid
            emojis={filteredGroups.travel}
            onEmojiClick={onEmojiClick}
          />
        </div>
      )}
      {filteredGroups.activities.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium pl-2 text-muted-foreground">
            ACTIVITIES
          </p>
          <EmojiGrid
            emojis={filteredGroups.activities}
            onEmojiClick={onEmojiClick}
          />
        </div>
      )}
      {filteredGroups.objects.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium pl-2 text-muted-foreground">
            OBJECTS
          </p>
          <EmojiGrid
            emojis={filteredGroups.objects}
            onEmojiClick={onEmojiClick}
          />
        </div>
      )}
      {filteredGroups.symbols.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium pl-2 text-muted-foreground">
            SYMBOLS
          </p>
          <EmojiGrid
            emojis={filteredGroups.symbols}
            onEmojiClick={onEmojiClick}
          />
        </div>
      )}
      {filteredGroups.flags.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium pl-2 text-muted-foreground">
            FLAGS
          </p>
          <EmojiGrid
            emojis={filteredGroups.flags}
            onEmojiClick={onEmojiClick}
          />
        </div>
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
}) => {
  const handleClick = (emoji: string) => () => onEmojiClick(emoji);
  return (
    <div className="grid gap-0 rounded-md grid-cols-[repeat(auto-fill,minmax(32px,1fr))]">
      {emojiList.map((emoji) => (
        <Button
          onClick={handleClick(emoji)}
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
};
