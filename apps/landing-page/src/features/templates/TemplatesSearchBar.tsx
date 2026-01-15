import { Input } from "@typebot.io/ui/components/Input";
import { Search01Icon } from "@typebot.io/ui/icons/Search01Icon";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const TemplatesSearchBar = ({ value, onChange }: Props) => {
  return (
    <div className="relative w-full max-w-xs ml-auto">
      <Search01Icon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground z-10 pointer-events-none" />
      <Input
        type="text"
        placeholder="Search templates..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 rounded-xl bg-white"
      />
    </div>
  );
};
