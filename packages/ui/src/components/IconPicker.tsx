import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../lib/cn";
import { Button } from "./Button";
import { ColorPicker as ColorPickerComponent } from "./ColorPicker";
import { Input } from "./Input";
import { iconNames as defaultIconNames } from "./iconNames";

const batchSize = 200;
const localStorageRecentIconNamesKey = "recentIconNames";
const localStorageDefaultIconColorKey = "defaultIconColor";

type IconPickerContextValue = {
  selectedColor: string;
  displayedIconNames: string[];
  recentIconNames: string[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  bottomElementRef: React.RefObject<HTMLDivElement | null>;
  isWhiteOnDark: boolean;
  updateColor: (color: string) => void;
  searchIcon: (query: string) => void;
  selectIcon: (name: string) => void;
};

const IconPickerContext = createContext<IconPickerContextValue | null>(null);

const useIconPickerContext = () => {
  const ctx = use(IconPickerContext);
  if (!ctx)
    throw new Error(
      "IconPicker components must be used within IconPicker.Root",
    );
  return ctx;
};

type RootProps = {
  iconNames?: string[];
  defaultColor?: string;
  children: React.ReactNode;
  onIconSelected: (dataUri: string) => void;
  getIconSvg?: (name: string) => Promise<string>;
};

const Root = ({
  iconNames = defaultIconNames,
  defaultColor = "#222222",
  children,
  onIconSelected,
  getIconSvg,
}: RootProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomElementRef = useRef<HTMLDivElement>(null);
  const searchQueryRef = useRef("");
  const [displayedIconNames, setDisplayedIconNames] = useState(
    iconNames.slice(0, batchSize),
  );
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [recentIconNames, setRecentIconNames] = useState<string[]>([]);

  const isWhiteOnDark = useMemo(
    () =>
      defaultColor === "#222222" &&
      (selectedColor.toLowerCase() === "#ffffff" ||
        selectedColor.toLowerCase() === "#fff" ||
        selectedColor === "white"),
    [defaultColor, selectedColor],
  );

  useEffect(() => {
    const stored = localStorage.getItem(localStorageRecentIconNamesKey);
    const storedColor = localStorage.getItem(localStorageDefaultIconColorKey);
    if (stored) setRecentIconNames(JSON.parse(stored));
    if (storedColor) setSelectedColor(storedColor);
  }, []);

  useEffect(() => {
    if (!bottomElementRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && searchQueryRef.current.length <= 2) {
          setDisplayedIconNames((prev) => [
            ...prev,
            ...iconNames.slice(prev.length, prev.length + batchSize),
          ]);
        }
      },
      { root: scrollContainerRef.current, rootMargin: "200px" },
    );
    observer.observe(bottomElementRef.current);
    return () => observer.disconnect();
  }, [iconNames]);

  const searchIcon = useCallback(
    (query: string) => {
      searchQueryRef.current = query;
      if (query.length <= 2)
        return setDisplayedIconNames(iconNames.slice(0, batchSize));
      setDisplayedIconNames(
        iconNames.filter((n) => n.toLowerCase().includes(query.toLowerCase())),
      );
    },
    [iconNames],
  );

  const updateColor = useCallback((color: string) => {
    if (!color.startsWith("#")) return;
    localStorage.setItem(localStorageDefaultIconColorKey, color);
    setSelectedColor(color);
  }, []);

  const fetchSvg = useCallback(
    (name: string) =>
      getIconSvg
        ? getIconSvg(name)
        : fetch(`/icons/${name}.svg`).then((r) => r.text()),
    [getIconSvg],
  );

  const selectIcon = useCallback(
    async (iconName: string) => {
      setRecentIconNames((prev) => {
        const updated = [...new Set([iconName, ...prev].slice(0, 30))];
        localStorage.setItem(
          localStorageRecentIconNamesKey,
          JSON.stringify(updated),
        );
        return updated;
      });
      const svg = await fetchSvg(iconName);
      const dataUri = `data:image/svg+xml;utf8,${svg
        .replace("<svg", `<svg fill='${encodeURIComponent(selectedColor)}'`)
        .replace(/"/g, "'")}`;
      onIconSelected(dataUri);
    },
    [fetchSvg, selectedColor, onIconSelected],
  );

  return (
    <IconPickerContext
      value={{
        selectedColor,
        displayedIconNames,
        recentIconNames,
        scrollContainerRef,
        bottomElementRef,
        isWhiteOnDark,
        updateColor,
        searchIcon,
        selectIcon,
      }}
    >
      {children}
    </IconPickerContext>
  );
};

const SearchInput = ({
  placeholder = "Search...",
  debounceTimeout = 300,
}: { placeholder?: string; debounceTimeout?: number }) => {
  const { searchIcon } = useIconPickerContext();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = (value: string) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => searchIcon(value), debounceTimeout);
  };

  return <Input placeholder={placeholder} onValueChange={handleChange} />;
};

const IconColorPicker = ({
  side = "right",
  advancedColorsLabel,
}: { side?: "top" | "bottom" | "left" | "right"; advancedColorsLabel?: string }) => {
  const { selectedColor, updateColor } = useIconPickerContext();
  return (
    <ColorPickerComponent
      value={selectedColor}
      onColorChange={updateColor}
      side={side}
      advancedColorsLabel={advancedColorsLabel}
    />
  );
};

const List = () => {
  const {
    displayedIconNames,
    recentIconNames,
    selectIcon,
    selectedColor,
    scrollContainerRef,
    bottomElementRef,
    isWhiteOnDark,
  } = useIconPickerContext();

  return (
    <div
      className="flex flex-col overflow-y-auto max-h-87.5 gap-4"
      ref={scrollContainerRef}
    >
      {recentIconNames.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium pl-2 text-gray-7">RECENT</p>
          <div
            className={cn(
              "grid gap-0 rounded-md grid-cols-[repeat(auto-fill,minmax(38px,1fr))]",
              isWhiteOnDark && "bg-gray-7",
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
                <IconPreview name={iconName} color={selectedColor} />
              </Button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {recentIconNames.length > 0 && (
          <p className="text-xs font-medium pl-2 text-muted-foreground">
            ICONS
          </p>
        )}
        <div
          className={cn(
            "grid gap-0 rounded-md grid-cols-[repeat(auto-fill,minmax(38px,1fr))]",
            isWhiteOnDark && "bg-gray-7",
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
              <IconPreview name={iconName} color={selectedColor} />
            </Button>
          ))}
        </div>
      </div>
      <div ref={bottomElementRef} />
    </div>
  );
};

const IconPreview = ({ name, color }: { name: string; color: string }) => {
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

export const IconPicker = {
  Root,
  SearchInput,
  ColorPicker: IconColorPicker,
  List,
};
