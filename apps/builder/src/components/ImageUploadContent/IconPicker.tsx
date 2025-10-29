import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { cx } from "@typebot.io/ui/lib/cva";
import { useEffect, useMemo, useRef, useState } from "react";
import { useThemeValue } from "@/hooks/useThemeValue";
import { ColorPicker } from "../ColorPicker";
import { DebouncedTextInput } from "../inputs/DebouncedTextInput";
import { iconNames } from "./iconNames";

const batchSize = 200;

type Props = {
  onIconSelected: (url: string) => void;
};

const localStorageRecentIconNamesKey = "recentIconNames";
const localStorageDefaultIconColorKey = "defaultIconColor";

export const IconPicker = ({ onIconSelected }: Props) => {
  const initialIconColor = useThemeValue("#222222", "#ffffff");
  const scrollContainer = useRef<HTMLDivElement>(null);
  const bottomElement = useRef<HTMLDivElement>(null);
  const [displayedIconNames, setDisplayedIconNames] = useState(
    iconNames.slice(0, batchSize),
  );
  const searchQuery = useRef<string>("");
  const [selectedColor, setSelectedColor] = useState(initialIconColor);
  const isWhite = useMemo(
    () =>
      initialIconColor === "#222222" &&
      (selectedColor.toLowerCase() === "#ffffff" ||
        selectedColor.toLowerCase() === "#fff" ||
        selectedColor === "white"),
    [initialIconColor, selectedColor],
  );
  const [recentIconNames, setRecentIconNames] = useState([]);
  const { t } = useTranslate();

  useEffect(() => {
    const recentIconNames = localStorage.getItem(
      localStorageRecentIconNamesKey,
    );
    const defaultIconColor = localStorage.getItem(
      localStorageDefaultIconColorKey,
    );
    if (recentIconNames) setRecentIconNames(JSON.parse(recentIconNames));
    if (defaultIconColor) setSelectedColor(defaultIconColor);
  }, []);

  useEffect(() => {
    if (!bottomElement.current) return;
    const observer = new IntersectionObserver(handleObserver, {
      root: scrollContainer.current,
      rootMargin: "200px",
    });
    if (bottomElement.current) observer.observe(bottomElement.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  const handleObserver = (entities: IntersectionObserverEntry[]) => {
    const target = entities[0];
    if (target.isIntersecting && searchQuery.current.length <= 2)
      setDisplayedIconNames((displayedIconNames) => [
        ...displayedIconNames,
        ...iconNames.slice(
          displayedIconNames.length,
          displayedIconNames.length + batchSize,
        ),
      ]);
  };

  const searchIcon = async (query: string) => {
    searchQuery.current = query;
    if (query.length <= 2)
      return setDisplayedIconNames(iconNames.slice(0, batchSize));
    const filteredIconNames = iconNames.filter((iconName) =>
      iconName.toLowerCase().includes(query.toLowerCase()),
    );
    setDisplayedIconNames(filteredIconNames);
  };

  const updateColor = (color: string) => {
    if (!color.startsWith("#")) return;
    localStorage.setItem(localStorageDefaultIconColorKey, color);
    setSelectedColor(color);
  };

  const selectIcon = async (iconName: string) => {
    localStorage.setItem(
      localStorageRecentIconNamesKey,
      JSON.stringify([...new Set([iconName, ...recentIconNames].slice(0, 30))]),
    );
    const svg = await (await fetch(`/icons/${iconName}.svg`)).text();
    const dataUri = `data:image/svg+xml;utf8,${svg
      .replace("<svg", `<svg fill='${encodeURIComponent(selectedColor)}'`)
      .replace(/"/g, "'")}`;
    onIconSelected(dataUri);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <DebouncedTextInput
          placeholder={t("emojiList.searchInput.placeholder")}
          onValueChange={searchIcon}
          debounceTimeout={300}
        />
        <ColorPicker
          value={selectedColor}
          onColorChange={updateColor}
          side="right"
        />
      </div>
      <div
        className="flex flex-col overflow-y-auto max-h-[350px] gap-4"
        ref={scrollContainer}
      >
        {recentIconNames.length > 0 && (
          <div className="flex flex-col gap-2">
            <p
              className="text-xs font-medium pl-2 text-gray-7"
              color="gray.400"
            >
              RECENT
            </p>
            <div
              className={cx(
                "grid gap-0 rounded-md grid-cols-[repeat(auto-fill,minmax(38px,1fr))]",
                isWhite ? "bg-gray-7" : undefined,
              )}
            >
              {recentIconNames.map((iconName) => (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-xl w-8 h-8 p-1.5"
                  key={iconName}
                  onClick={() => selectIcon(iconName)}
                >
                  <Icon name={iconName} color={selectedColor} />
                </Button>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {recentIconNames.length > 0 && (
            <p className="text-xs font-medium pl-2" color="gray.400">
              ICONS
            </p>
          )}
          <div
            className={cx(
              "grid gap-0 rounded-md grid-cols-[repeat(auto-fill,minmax(38px,1fr))]",
              isWhite ? "bg-gray-7" : undefined,
            )}
          >
            {displayedIconNames.map((iconName) => (
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 p-1.5"
                key={iconName}
                onClick={() => selectIcon(iconName)}
              >
                <Icon name={iconName} color={selectedColor} />
              </Button>
            ))}
          </div>
        </div>

        <div ref={bottomElement} />
      </div>
    </div>
  );
};

const Icon = ({ name, color }: { name: string; color: string }) => {
  const [svg, setSvg] = useState("");

  const dataUri = useMemo(
    () =>
      `data:image/svg+xml;utf8,${svg.replace(
        "<svg",
        `<svg fill='${encodeURIComponent(color)}'`,
      )}`,
    [svg, color],
  );

  useEffect(() => {
    fetch(`/icons/${name}.svg`)
      .then((response) => response.text())
      .then((text) => setSvg(text));
  }, [name]);

  if (!svg) return null;

  return <img src={dataUri} alt={name} className="size-full" />;
};
