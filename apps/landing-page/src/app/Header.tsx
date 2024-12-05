"use client";

import { TypebotLogoFull } from "@/assets/logos/TypebotLogo";
import { Button, buttonVariants } from "@/components/button";
import { IconButton } from "@/components/icon-button";
import { cn } from "@/lib/utils";
import { CloseIcon } from "@typebot.io/ui/icons/CloseIcon";
import { MenuIcon } from "@typebot.io/ui/icons/MenuIcon";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { useWindowSize } from "react-use";
import {
  breakpoints,
  discordUrl,
  docsUrl,
  githubRepoUrl,
  signinUrl,
} from "./constants";

let isFirstCall = true;

const links = [
  {
    label: "Documentation",
    href: docsUrl,
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
  {
    label: "GitHub",
    href: githubRepoUrl,
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Community",
    href: discordUrl,
  },
];

export const Header = () => {
  const [isOpened, setIsOpened] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [appearance, setAppearance] = useState<"light" | "dark">("dark");
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  useEffect(() => {
    const isMobile = windowWidth < breakpoints.md;
    const options = {
      root: null,
      rootMargin: `0px 0px ${isMobile ? -windowHeight - 100 : 0}px 0px`,
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      if (isFirstCall) {
        isFirstCall = false;
        return;
      }
      entries.forEach((entry) => {
        if (entry.isIntersecting)
          entry.target.classList.contains("dark")
            ? setAppearance("dark")
            : setAppearance("light");
        else {
          entry.target.classList.contains("dark")
            ? setAppearance("light")
            : setAppearance("dark");
        }
      });
    }, options);

    [...document.getElementsByTagName("section")].forEach((element) => {
      if (element.id === "header") return;
      observer.observe(element);
    });

    return () => {
      [...document.getElementsByTagName("section")].forEach((element) => {
        if (element.id === "header") return;
        observer.unobserve(element);
      });
    };
  }, [windowWidth, windowHeight]);

  const toggleHeaderExpansion = () => {
    setIsOpened((prev) => !prev);
  };

  return (
    <header className="flex justify-center">
      <Mobile
        ref={headerRef}
        appearance={appearance}
        isOpened={isOpened}
        toggleHeaderExpansion={toggleHeaderExpansion}
        className="md:hidden"
        aria-label="Mobile header navigation"
      />
      <Desktop
        ref={headerRef}
        appearance={appearance}
        className="hidden md:flex"
        aria-label="Mobile header navigation"
      />
    </header>
  );
};

type Props = {
  appearance: "light" | "dark";
  isOpened: boolean;
  toggleHeaderExpansion: () => void;
  className: string;
};

const Mobile = React.forwardRef<HTMLElement, Props>(function Mobile(
  { appearance, isOpened, toggleHeaderExpansion, className },
  ref,
) {
  return (
    <motion.nav
      ref={ref}
      className={clsx(
        "flex flex-col gap-8 justify-start backdrop-blur-md rounded-lg border-2 w-[calc(100%-2rem)] will-change-transform duration-300 transition-colors",
        appearance === "light"
          ? "bg-white/50"
          : "dark bg-gray-1/60 text-gray-12",
        className,
      )}
      transition={{ duration: 0.4, type: "spring", bounce: 0.15 }}
      animate={{ height: isOpened ? "calc(100vh - 7rem)" : "auto" }}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <TypebotLogoFull />
        <IconButton
          aria-label={isOpened ? "Close menu" : "Open menu"}
          variant="ghost"
          onClick={toggleHeaderExpansion}
          className="transition-none"
        >
          {isOpened ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      </div>
      <AnimatePresence mode="popLayout">
        {isOpened && (
          <motion.nav
            className="flex flex-col gap-8 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Link
              href={signinUrl}
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Sign in
            </Link>
            <hr className="border-gray-7" />
            <div className="grid grid-cols-2 gap-2">
              {links.map((link) => (
                <Link
                  key={link.label}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                  )}
                  href={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.nav>
  );
});

const desktopLinks = [
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Community",
    href: discordUrl,
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
  {
    label: "Documentation",
    href: docsUrl,
  },
  {
    label: "GitHub",
    href: githubRepoUrl,
  },
];

const Desktop = React.forwardRef<
  HTMLElement,
  Pick<Props, "appearance" | "className">
>(function MobileHeader({ appearance, className }, ref) {
  return (
    <nav
      ref={ref}
      className={clsx(
        "flex rounded-2xl border border-gray-6 px-2 py-2 bg-gradient-to-b transition-colors gap-2 items-center",
        appearance === "dark"
          ? "dark from-[#393939] to-[#121212]"
          : "from-gray-1 to-[#DEDEDE]",
        className,
      )}
    >
      {desktopLinks.map((link) => (
        <Link
          key={link.label}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "font-normal",
          )}
          href={link.href}
          target={link.href.startsWith("/") ? undefined : "_blank"}
        >
          {link.label}
        </Link>
      ))}
      <Button variant="cta" size="sm">
        Get started free
      </Button>
    </nav>
  );
});
