import { TypebotLogoFull } from "@/assets/logos/TypebotLogo";
import { buttonVariants } from "@/components/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { signinUrl } from "./constants";

type Props = {
  className?: string;
};

export const DesktopHeaderTop = ({ className }: Props) => (
  <div
    className={cn(
      "dark flex justify-center items-center fixed top-4 w-full z-10 h-16 max-w-6xl",
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
