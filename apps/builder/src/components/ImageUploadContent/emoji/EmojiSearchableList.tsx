import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { Input } from "@typebot.io/ui/components/Input";
import emojiTagsData from "emojilib";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import emojis from "./emojiList.json";

const emojiTags = emojiTagsData as Record<string, string[]>;

const people = emojis["Smileys & Emotion"].concat(emojis["People & Body"]);
const nature = emojis["Animals & Nature"];
const food = emojis["Food & Drink"];
const activities = emojis["Activities"];
const travel = emojis["Travel & Places"];
const objects = emojis["Objects"];
const symbols = emojis["Symbols"];
const flags = emojis["Flags"];

const localStorageRecentEmojisKey = "recentEmojis";

export const EmojiSearchableList = ({
  onEmojiSelected,
}: {
  onEmojiSelected: (emoji: string) => void;
}) => {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const bottomElement = useRef<HTMLDivElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [filteredPeople, setFilteredPeople] = useState(people);
  const [filteredAnimals, setFilteredAnimals] = useState(nature);
  const [filteredFood, setFilteredFood] = useState(food);
  const [filteredTravel, setFilteredTravel] = useState(travel);
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [filteredObjects, setFilteredObjects] = useState(objects);
  const [filteredSymbols, setFilteredSymbols] = useState(symbols);
  const [filteredFlags, setFilteredFlags] = useState(flags);
  const [totalDisplayedCategories, setTotalDisplayedCategories] = useState(1);
  const [recentEmojis, setRecentEmojis] = useState([]);
  const { t } = useTranslate();

  useEffect(() => {
    const recentIconNames = localStorage.getItem(localStorageRecentEmojisKey);
    if (!recentIconNames) return;
    setRecentEmojis(JSON.parse(recentIconNames));
  }, []);

  useEffect(() => {
    if (!bottomElement.current) return;
    const observer = new IntersectionObserver(handleObserver, {
      root: scrollContainer.current,
    });
    if (bottomElement.current) observer.observe(bottomElement.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  const handleObserver = (entities: IntersectionObserverEntry[]) => {
    const target = entities[0];
    if (target.isIntersecting) setTotalDisplayedCategories((c) => c + 1);
  };

  const handleSearchChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    if (searchValue.length <= 2 && isSearching) return resetEmojiList();
    setIsSearching(true);
    setTotalDisplayedCategories(8);
    const byTag = (emoji: string) =>
      emojiTags[emoji].find((tag) => tag.includes(searchValue));
    setFilteredPeople(people.filter(byTag));
    setFilteredAnimals(nature.filter(byTag));
    setFilteredFood(food.filter(byTag));
    setFilteredTravel(travel.filter(byTag));
    setFilteredActivities(activities.filter(byTag));
    setFilteredObjects(objects.filter(byTag));
    setFilteredSymbols(symbols.filter(byTag));
    setFilteredFlags(flags.filter(byTag));
  };

  const resetEmojiList = () => {
    setTotalDisplayedCategories(1);
    setIsSearching(false);
    setFilteredPeople(people);
    setFilteredAnimals(nature);
    setFilteredFood(food);
    setFilteredTravel(travel);
    setFilteredActivities(activities);
    setFilteredObjects(objects);
    setFilteredSymbols(symbols);
    setFilteredFlags(flags);
  };

  const selectEmoji = (emoji: string) => {
    localStorage.setItem(
      localStorageRecentEmojisKey,
      JSON.stringify([...new Set([emoji, ...recentEmojis].slice(0, 30))]),
    );
    onEmojiSelected(emoji);
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder={t("emojiList.searchInput.placeholder")}
        onChange={handleSearchChange}
      />
      <div
        className="flex flex-col overflow-y-auto max-h-[350px] gap-4"
        ref={scrollContainer}
      >
        {recentEmojis.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium pl-2" color="gray.400">
              {t("emojiList.categories.recent.label")}
            </p>
            <EmojiGrid emojis={recentEmojis} onEmojiClick={selectEmoji} />
          </div>
        )}
        {filteredPeople.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium pl-2" color="gray.400">
              {t("emojiList.categories.people.label")}
            </p>
            <EmojiGrid emojis={filteredPeople} onEmojiClick={selectEmoji} />
          </div>
        )}
        {filteredAnimals.length > 0 && totalDisplayedCategories >= 2 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium pl-2" color="gray.400">
              {t("emojiList.categories.animalsAndNature.label")}
            </p>
            <EmojiGrid emojis={filteredAnimals} onEmojiClick={selectEmoji} />
          </div>
        )}
        {filteredFood.length > 0 && totalDisplayedCategories >= 3 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium pl-2" color="gray.400">
              {t("emojiList.categories.foodAndDrink.label")}
            </p>
            <EmojiGrid emojis={filteredFood} onEmojiClick={selectEmoji} />
          </div>
        )}
        {filteredTravel.length > 0 && totalDisplayedCategories >= 4 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium pl-2" color="gray.400">
              {t("emojiList.categories.travelAndPlaces.label")}
            </p>
            <EmojiGrid emojis={filteredTravel} onEmojiClick={selectEmoji} />
          </div>
        )}
        {filteredActivities.length > 0 && totalDisplayedCategories >= 5 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium pl-2" color="gray.400">
              {t("emojiList.categories.activities.label")}
            </p>
            <EmojiGrid emojis={filteredActivities} onEmojiClick={selectEmoji} />
          </div>
        )}
        {filteredObjects.length > 0 && totalDisplayedCategories >= 6 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium pl-2" color="gray.400">
              {t("emojiList.categories.objects.label")}
            </p>
            <EmojiGrid emojis={filteredObjects} onEmojiClick={selectEmoji} />
          </div>
        )}
        {filteredSymbols.length > 0 && totalDisplayedCategories >= 7 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium pl-2" color="gray.400">
              {t("emojiList.categories.symbols.label")}
            </p>
            <EmojiGrid emojis={filteredSymbols} onEmojiClick={selectEmoji} />
          </div>
        )}
        {filteredFlags.length > 0 && totalDisplayedCategories >= 8 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium pl-2" color="gray.400">
              {t("emojiList.categories.flags.label")}
            </p>
            <EmojiGrid emojis={filteredFlags} onEmojiClick={selectEmoji} />
          </div>
        )}
        <div ref={bottomElement} />
      </div>
    </div>
  );
};

const EmojiGrid = ({
  emojis,
  onEmojiClick,
}: {
  emojis: string[];
  onEmojiClick: (emoji: string) => void;
}) => {
  const handleClick = (emoji: string) => () => onEmojiClick(emoji);
  return (
    <div className="grid gap-0 rounded-md grid-cols-[repeat(auto-fill,minmax(32px,1fr))]">
      {emojis.map((emoji) => (
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
