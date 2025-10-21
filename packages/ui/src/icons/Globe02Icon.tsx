import { Icon } from "../components/Icon";

export const Globe02Icon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2C12 2 8 6 8 12Z" />
    <path d="M21 15H3" />
    <path d="M21 9H3" />
  </Icon>
);
