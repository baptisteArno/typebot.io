import { features, useCases } from "@typebot.io/templates";
import { Checkbox } from "@typebot.io/ui/components/Checkbox";
import { Label } from "@typebot.io/ui/components/Label";
import { Popover } from "@typebot.io/ui/components/Popover";

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
  mobile?: boolean;
};

export const TemplatesFilterSidebar = ({
  selectedFilters,
  onFilterChange,
  mobile,
}: Props) => {
  const getSelectedCount = (category: string) => {
    return selectedFilters[category]?.length ?? 0;
  };

  if (mobile)
    return (
      <div className="flex md:hidden gap-2 flex-wrap">
        {filterCategories.map((category) => {
          const selectedCount = getSelectedCount(category.label);
          return (
            <Popover.Root key={category.label}>
              <Popover.TriggerButton
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <span>{category.label}</span>
                {selectedCount > 0 && (
                  <span className="flex items-center justify-center size-5 text-xs bg-primary text-primary-foreground rounded-full">
                    {selectedCount}
                  </span>
                )}
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>Templates Filter Sidebar</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Popover.TriggerButton>
              <Popover.Popup align="start" className="min-w-48">
                {category.options.map((option) => {
                  const isChecked =
                    selectedFilters[category.label]?.includes(option) ?? false;
                  return (
                    <Label
                      key={option}
                      className="px-2 py-1.5 cursor-pointer hover:bg-muted rounded font-normal"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() =>
                          onFilterChange(category.label, option)
                        }
                      />
                      <span className="text-sm">{option}</span>
                    </Label>
                  );
                })}
              </Popover.Popup>
            </Popover.Root>
          );
        })}
      </div>
    );

  return (
    <aside className="hidden md:flex flex-col gap-4 w-56 shrink-0 bg-background rounded-md p-4 border h-fit">
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
                <Label key={option} className="cursor-pointer font-normal">
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() =>
                      onFilterChange(category.label, option)
                    }
                  />
                  <span className="text-sm">{option}</span>
                </Label>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
};
