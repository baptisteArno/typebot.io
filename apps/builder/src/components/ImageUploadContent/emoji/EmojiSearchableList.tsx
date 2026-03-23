import { EmojisList } from "@typebot.io/ui/components/EmojisList";
import { Input } from "@typebot.io/ui/components/Input";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";

const localStorageRecentEmojisKey = "recentEmojis";

export const EmojiSearchableList = ({
  onEmojiSelected,
}: {
  onEmojiSelected: (emoji: string) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);

  useEffect(() => {
    const recentIconNames = localStorage.getItem(localStorageRecentEmojisKey);
    if (!recentIconNames) return;
    setRecentEmojis(JSON.parse(recentIconNames));
  }, []);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const selectEmoji = (emoji: string) => {
    localStorage.setItem(
      localStorageRecentEmojisKey,
      JSON.stringify([...new Set([emoji, ...recentEmojis].slice(0, 30))]),
    );
    setRecentEmojis((previous) =>
      [...new Set([emoji, ...previous])].slice(0, 30),
    );
    onEmojiSelected(emoji);
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearchChange}
      />
      <EmojisList
        searchQuery={searchQuery}
        recentEmojis={recentEmojis}
        onEmojiClick={selectEmoji}
      />
    </div>
  );
};
