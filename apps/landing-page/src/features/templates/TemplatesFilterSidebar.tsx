import { useState } from "react";
import { features, useCases } from "./templatesData";

type FilterCategory = {
  label: string;
  options: readonly string[];
};

const filterCategories: FilterCategory[] = [
  {
    label: "Use Case",
    options: useCases,
  },
  {
    label: "Features",
    options: features,
  },
];

type Props = {
  selectedFilters: Record<string, string[]>;
  onFilterChange: (category: string, option: string) => void;
};

export const TemplatesFilterSidebar = ({
  selectedFilters,
  onFilterChange,
}: Props) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const getSelectedCount = (category: string) => {
    return selectedFilters[category]?.length ?? 0;
  };

  const toggleDropdown = (category: string) => {
    setOpenDropdown((prev) => (prev === category ? null : category));
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col gap-6 w-56 shrink-0">
        <h2 className="text-lg font-semibold">Filters</h2>
        {filterCategories.map((category) => (
          <div key={category.label} className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {category.label}
            </h3>
            <div className="flex flex-col gap-1">
              {category.options.map((option) => {
                const isChecked =
                  selectedFilters[category.label]?.includes(option) ?? false;
                return (
                  <label
                    key={option}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onFilterChange(category.label, option)}
                      className="size-4 rounded border-border accent-primary"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </aside>

      {/* Mobile dropdowns */}
      <div className="flex md:hidden gap-2 w-full flex-wrap">
        {filterCategories.map((category) => {
          const selectedCount = getSelectedCount(category.label);
          const isOpen = openDropdown === category.label;
          return (
            <div key={category.label} className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown(category.label)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg bg-background hover:bg-muted transition-colors"
              >
                <span>{category.label}</span>
                {selectedCount > 0 && (
                  <span className="flex items-center justify-center size-5 text-xs bg-primary text-primary-foreground rounded-full">
                    {selectedCount}
                  </span>
                )}
                <svg
                  className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isOpen && (
                <div className="absolute top-full left-0 mt-1 z-10 min-w-48 p-2 bg-background border border-border rounded-lg shadow-lg">
                  {category.options.map((option) => {
                    const isChecked =
                      selectedFilters[category.label]?.includes(option) ??
                      false;
                    return (
                      <label
                        key={option}
                        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted rounded"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            onFilterChange(category.label, option)
                          }
                          className="size-4 rounded border-border accent-primary"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
