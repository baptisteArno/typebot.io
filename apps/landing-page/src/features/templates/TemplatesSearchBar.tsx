type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const TemplatesSearchBar = ({ value, onChange }: Props) => {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        placeholder="Search templates..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
};
