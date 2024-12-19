import { buttonVariants } from "@/components/Button";
import { TypebotLogoFull } from "@/components/TypebotLogo";
import { signinUrl } from "@/constants";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";

type Props = {
  className?: string;
};

export const TopBar = ({ className }: Props) => {
  const { pathname } = useLocation();

  return (
    <div
      className={cn(
        "bg-transparent flex items-center flex-1 h-16 max-w-7xl relative",
        className,
      )}
    >
      <Link to="/">
        <TypebotLogoFull />
      </Link>
      {pathname === "/" && (
        <Link
          href={signinUrl}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "absolute right-4",
          )}
        >
          Go to dashboard
        </Link>
      )}
    </div>
  );
};
