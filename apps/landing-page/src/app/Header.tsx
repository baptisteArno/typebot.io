"use client";

import { TypebotLogo } from "@/assets/logos/TypebotLogo";
import {
  Box,
  HStack,
  IconButton,
  Theme,
  useDisclosure,
} from "@chakra-ui/react";
import { CloseIcon } from "@typebot.io/ui/icons/CloseIcon";
import { MenuIcon } from "@typebot.io/ui/icons/MenuIcon";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

let isFirstCall = true;

export const Header = () => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const { open, onToggle } = useDisclosure();
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

    document.querySelectorAll(".chakra-theme").forEach((element) => {
      if (element.id === "header") return;
      observer.observe(element);
    });

    return () => {
      document.querySelectorAll(".chakra-theme").forEach((element) => {
        if (element.id === "header") return;
        observer.unobserve(element);
      });
    };
  }, []);

  return (
    <Theme appearance={appearance} id="header">
      <Box
        asChild
        ref={headerRef}
        display="flex"
        bgColor={
          appearance === "light"
            ? "rgba(255 255 255 / 50%)"
            : "rgba(13 13 13 / 60%)"
        }
        px="4"
        py="2"
        alignItems="flex-start"
        justifyContent="space-between"
        backdropFilter="blur(20px)"
        rounded="lg"
        borderWidth="2px"
        pos="fixed"
        top="1rem"
        ml="1rem"
        width="calc(100% - 2rem)"
        zIndex="1"
        style={{ height: open ? "40vh" : undefined }}
        willChange="transform"
        transitionDuration="0.3s"
        transitionProperty="background-color, border-color"
      >
        <motion.header
          layout
          transition={{ duration: 0.4, type: "spring", bounce: 0.15 }}
          style={{ borderRadius: "8px" }}
        >
          <HStack w="full" justifyContent="space-between" h="36px">
            <motion.div layout>
              <TypebotLogo />
            </motion.div>
            <motion.div layout>
              <IconButton
                ref={btnRef}
                aria-label={open ? "Close menu" : "Open menu"}
                variant="ghost"
                onClick={onToggle}
                size="sm"
              >
                {open ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            </motion.div>
          </HStack>
        </motion.header>
      </Box>
    </Theme>
  );
};
