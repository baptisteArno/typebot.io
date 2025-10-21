import { Icon } from "../components/Icon";

export const LeftToRightListBulletIcon = ({
  className,
}: {
  className?: string;
}) => (
  <Icon className={className}>
    <path d="M8 5L20 5" />
    <path d="M4 5H4.00898" />
    <path d="M4 12H4.00898" />
    <path d="M4 19H4.00898" />
    <path d="M8 12L20 12" />
    <path d="M8 19L20 19" />
  </Icon>
);
