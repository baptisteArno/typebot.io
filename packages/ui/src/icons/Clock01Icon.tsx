import { Icon } from "../components/Icon";

export const Clock01Icon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8V12L14 14" />
  </Icon>
);
