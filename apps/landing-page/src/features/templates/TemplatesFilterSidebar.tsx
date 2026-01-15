type FilterCategory = {
  label: string;
  options: string[];
};

const filterCategories: FilterCategory[] = [
  {
    label: "Category",
    options: ["Marketing", "Support", "Sales", "HR", "Education"],
  },
  {
    label: "Complexity",
    options: ["Simple", "Intermediate", "Advanced"],
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
  return (
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
  );
};
