import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@typebot.io/ui/lib/cn";
import { ButtonLink } from "@/components/link";
import { TypebotLogoFull } from "@/components/TypebotLogo";
import { dashboardUrl } from "@/constants";
import { useIsAuthenticated } from "@/hooks/useIsAuthenticated";

type Props = {
  className?: string;
};

export const TopBar = ({ className }: Props) => {
  const { pathname } = useLocation();
  const isAuthenticated = useIsAuthenticated();

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
      {pathname === "/" && isAuthenticated && (
        <ButtonLink href={dashboardUrl} variant="outline-secondary">
          Go to dashboard
        </ButtonLink>
      )}
    </div>
  );
};
