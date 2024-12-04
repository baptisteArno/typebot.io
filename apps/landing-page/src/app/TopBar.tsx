import { TypebotLogoFull } from "@/assets/logos/TypebotLogo";
import { buttonVariants } from "@/components/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { signinUrl } from "./constants";

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
