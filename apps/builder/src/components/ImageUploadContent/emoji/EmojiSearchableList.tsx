import {
  Button,
  GridItem,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
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
    <Stack>
      <Input
        placeholder={t("emojiList.searchInput.placeholder")}
        onChange={handleSearchChange}
      />
      <Stack ref={scrollContainer} overflowY="scroll" maxH="350px" spacing={4}>
        {recentEmojis.length > 0 && (
          <Stack>
            <Text fontSize="xs" color="gray.400" fontWeight="semibold" pl="2">
              {t("emojiList.categories.recent.label")}
            </Text>
            <EmojiGrid emojis={recentEmojis} onEmojiClick={selectEmoji} />
          </Stack>
        )}
        {filteredPeople.length > 0 && (
          <Stack>
            <Text fontSize="xs" color="gray.400" fontWeight="semibold" pl="2">
              {t("emojiList.categories.people.label")}
            </Text>
            <EmojiGrid emojis={filteredPeople} onEmojiClick={selectEmoji} />
          </Stack>
        )}
        {filteredAnimals.length > 0 && totalDisplayedCategories >= 2 && (
          <Stack>
            <Text fontSize="xs" color="gray.400" fontWeight="semibold" pl="2">
              {t("emojiList.categories.animalsAndNature.label")}
            </Text>
            <EmojiGrid emojis={filteredAnimals} onEmojiClick={selectEmoji} />
          </Stack>
        )}
        {filteredFood.length > 0 && totalDisplayedCategories >= 3 && (
          <Stack>
            <Text fontSize="xs" color="gray.400" fontWeight="semibold" pl="2">
              {t("emojiList.categories.foodAndDrink.label")}
            </Text>
            <EmojiGrid emojis={filteredFood} onEmojiClick={selectEmoji} />
          </Stack>
        )}
        {filteredTravel.length > 0 && totalDisplayedCategories >= 4 && (
          <Stack>
            <Text fontSize="xs" color="gray.400" fontWeight="semibold" pl="2">
              {t("emojiList.categories.travelAndPlaces.label")}
            </Text>
            <EmojiGrid emojis={filteredTravel} onEmojiClick={selectEmoji} />
          </Stack>
        )}
        {filteredActivities.length > 0 && totalDisplayedCategories >= 5 && (
          <Stack>
            <Text fontSize="xs" color="gray.400" fontWeight="semibold" pl="2">
              {t("emojiList.categories.activities.label")}
            </Text>
            <EmojiGrid emojis={filteredActivities} onEmojiClick={selectEmoji} />
          </Stack>
        )}
        {filteredObjects.length > 0 && totalDisplayedCategories >= 6 && (
          <Stack>
            <Text fontSize="xs" color="gray.400" fontWeight="semibold" pl="2">
              {t("emojiList.categories.objects.label")}
            </Text>
            <EmojiGrid emojis={filteredObjects} onEmojiClick={selectEmoji} />
          </Stack>
        )}
        {filteredSymbols.length > 0 && totalDisplayedCategories >= 7 && (
          <Stack>
            <Text fontSize="xs" color="gray.400" fontWeight="semibold" pl="2">
              {t("emojiList.categories.symbols.label")}
            </Text>
            <EmojiGrid emojis={filteredSymbols} onEmojiClick={selectEmoji} />
          </Stack>
        )}
        {filteredFlags.length > 0 && totalDisplayedCategories >= 8 && (
          <Stack>
            <Text fontSize="xs" color="gray.400" fontWeight="semibold" pl="2">
              {t("emojiList.categories.flags.label")}
            </Text>
            <EmojiGrid emojis={filteredFlags} onEmojiClick={selectEmoji} />
          </Stack>
        )}
        <div ref={bottomElement} />
      </Stack>
    </Stack>
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
    <SimpleGrid
      spacing={0}
      gridTemplateColumns={`repeat(auto-fill, minmax(32px, 1fr))`}
      rounded="md"
    >
      {emojis.map((emoji) => (
        <GridItem
          as={Button}
          onClick={handleClick(emoji)}
          variant="ghost"
          size="sm"
          fontSize="xl"
          key={emoji}
        >
          {emoji}
        </GridItem>
      ))}
    </SimpleGrid>
  );
};
