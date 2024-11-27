"use client";

import { TypebotLogo } from "@/assets/logos/TypebotLogo";
import { Button } from "@/components/button";
import { CloseIcon } from "@typebot.io/ui/icons/CloseIcon";
import { MenuIcon } from "@typebot.io/ui/icons/MenuIcon";
import clsx from "clsx";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

let isFirstCall = true;

export const Header = () => {
  const btnRef = useRef<HTMLButtonElement>(null);
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

    document.querySelectorAll(".section").forEach((element) => {
      if (element.id === "header") return;
      observer.observe(element);
    });

    return () => {
      document.querySelectorAll(".section").forEach((element) => {
        if (element.id === "header") return;
        observer.unobserve(element);
      });
    };
  }, []);

  const toggleHeaderExpansion = () => {
    setIsOpened((prev) => !prev);
  };

  return (
    <motion.header
      ref={headerRef}
      className={clsx(
        "flex px-4 py-2 items-start backdrop-blur-md rounded-lg border-2 fixed top-4 ml-4 w-[calc(100%-2rem)] z-10 will-change-transform duration-300 transition-colors",
        appearance === "light"
          ? "bg-white/50"
          : "dark bg-gray-1/60 text-gray-12",
        isOpened && "h-[40vh]",
      )}
      layout
      transition={{ duration: 0.4, type: "spring", bounce: 0.15 }}
    >
      <div className="flex items-center justify-between flex-1">
        <motion.div layout>
          <TypebotLogo />
        </motion.div>
        <motion.div layout>
          <Button
            ref={btnRef}
            size="icon"
            aria-label={isOpened ? "Close menu" : "Open menu"}
            variant="ghost"
            onClick={toggleHeaderExpansion}
            className="transition-none"
          >
            {isOpened ? <CloseIcon /> : <MenuIcon />}
          </Button>
        </motion.div>
      </div>
    </motion.header>
  );
};
