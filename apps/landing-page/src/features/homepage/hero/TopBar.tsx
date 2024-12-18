import { buttonVariants } from "@/components/Button";
import { TypebotLogoFull } from "@/components/TypebotLogo";
import { signinUrl } from "@/constants";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

type Props = {
  className?: string;
};

export const TopBar = ({ className }: Props) => (
  <div
    className={cn(
      "dark bg-transparent flex justify-center items-center flex-1 h-16 max-w-6xl relative",
      className,
    )}
  >
    <TypebotLogoFull />
    <Link
      href={signinUrl}
      className={cn(buttonVariants({ variant: "outline" }), "absolute right-4")}
    >
      Go to dashboard
    </Link>
  </div>
);
