"use client";

import { TypebotLogoFull } from "@/assets/logos/TypebotLogo";
import { buttonVariants } from "@/components/button";
import { IconButton } from "@/components/icon-button";
import { cn } from "@/lib/utils";
import { CloseIcon } from "@typebot.io/ui/icons/CloseIcon";
import { MenuIcon } from "@typebot.io/ui/icons/MenuIcon";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { discordUrl, docsUrl, githubRepoUrl, signinUrl } from "./constants";

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
    label: "Github",
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

export const FloatingHeader = () => {
  const [isOpened, setIsOpened] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [appearance, setAppearance] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: `0px 0px -${window.innerHeight - 100}px 0px`,
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
  }, []);

  const toggleHeaderExpansion = () => {
    setIsOpened((prev) => !prev);
  };

  return (
    <>
      <Mobile
        ref={headerRef}
        appearance={appearance}
        className="flex md:hidden"
        isOpened={isOpened}
        toggleHeaderExpansion={toggleHeaderExpansion}
      />
    </>
  );
};

type Props = {
  appearance: "light" | "dark";
  className: string | undefined;
  isOpened: boolean;
  toggleHeaderExpansion: () => void;
};

const Mobile = React.forwardRef<HTMLElement, Props>(function Mobile(
  { appearance, className, isOpened, toggleHeaderExpansion },
  ref,
) {
  return (
    <motion.header
      ref={ref}
      className={clsx(
        "flex flex-col gap-8 justify-start backdrop-blur-md rounded-lg border-2 fixed top-4 ml-4 w-[calc(100%-2rem)] z-10 will-change-transform duration-300 transition-colors",
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
          <motion.div
            className="flex flex-col gap-8 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
});

const Desktop = React.forwardRef<HTMLElement, Props>(function MobileHeader(
  { appearance, className, isOpened, toggleHeaderExpansion },
  ref,
) {
  return <header ref={ref} className={clsx("", className)}></header>;
});
