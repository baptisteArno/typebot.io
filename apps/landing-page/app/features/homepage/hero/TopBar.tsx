import { TypebotLogoFull } from "@/components/TypebotLogo";
import { ButtonLink } from "@/components/link";
import { signinUrl } from "@/constants";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@typebot.io/ui/lib/cn";

type Props = {
  className?: string;
};

export const TopBar = ({ className }: Props) => {
  const { pathname } = useLocation();

  return (
    <div
      className={cn(
        "bg-transparent flex items-center justify-between flex-1 h-16 max-w-7xl px-4",
        className,
      )}
    >
      <Link to="/">
        <TypebotLogoFull />
      </Link>
      {pathname === "/" && (
        <ButtonLink href={signinUrl} variant="outline">
          Go to dashboard
        </ButtonLink>
      )}
    </div>
  );
};
