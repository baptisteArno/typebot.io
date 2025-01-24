import { buttonVariants } from "@/components/Button";
import { IconButton } from "@/components/IconButton";
import { TypebotLogoFull } from "@/components/TypebotLogo";
import {
  breakpoints,
  discordUrl,
  docsUrl,
  githubRepoUrl,
  registerUrl,
  signinUrl,
} from "@/constants";
import { useWindowSize } from "@/features/homepage/hooks/useWindowSize";
import { cn } from "@/lib/utils";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { CloseIcon } from "@typebot.io/ui/icons/CloseIcon";
import { MenuIcon } from "@typebot.io/ui/icons/MenuIcon";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { TypebotBubble } from "./TypebotBubble";
import { ButtonLink, TextLink } from "./link";

const links = [
  {
    label: "Pricing",
    to: "/pricing",
  },
  {
    label: "Blog",
    to: "/blog",
  },
  {
    label: "Documentation",
    href: docsUrl,
  },
  {
    label: "GitHub",
    href: githubRepoUrl,
  },
  {
    label: "Community",
    href: discordUrl,
  },
  {
    label: "About",
    to: "/about",
  },
] as const;

type HeaderProps = {
  isOpened?: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const Header = ({ isOpened = false, onOpen, onClose }: HeaderProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [appearance, setAppearance] = useState<"light" | "dark">("dark");
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const router = useRouter();

  useEffect(() => {
    if (!windowWidth || !windowHeight) return;
    const isMobile = windowWidth < breakpoints.md;
    const options = {
      rootMargin: `0px 0px ${isMobile ? -(windowHeight - 50) : -70}px 0px`,
      threshold: 0,
    };

    const initializeObserver = () => {
      const observer = new IntersectionObserver(([entry]) => {
        entry.target.classList.contains("dark")
          ? setAppearance(entry.isIntersecting ? "dark" : "light")
          : setAppearance(entry.isIntersecting ? "light" : "dark");
      }, options);

      const elementsToObserve = [
        ...document.getElementsByTagName("section"),
        ...document.getElementsByTagName("footer"),
      ];

      elementsToObserve.forEach((element) => {
        observer.observe(element);
      });

      return observer;
    };

    let observer = initializeObserver();

    const routerSubscription = router.subscribe("onResolved", () => {
      observer.disconnect();
      observer = initializeObserver();
    });

    return () => {
      observer.disconnect();
      routerSubscription();
    };
  }, [windowWidth, windowHeight, setAppearance, router]);

  const toggleHeaderExpansion = () => {
    if (isOpened) {
      onClose();
    } else {
      onOpen();
    }
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
      className={cn(
        "flex flex-col gap-8 justify-start backdrop-blur-md rounded-lg border-2 w-[calc(100%-2rem)] will-change-transform duration-300 transition-colors",
        appearance === "light"
          ? "bg-white/50"
          : isOpened
            ? "dark bg-gray-1/90 text-gray-12"
            : "dark bg-gray-1/60 text-gray-12",
        className,
      )}
      transition={{ duration: 0.4, type: "spring", bounce: 0.15 }}
      animate={{ height: isOpened ? "calc(100dvh - 2rem)" : "auto" }}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <Link to="/">
          <TypebotLogoFull />
        </Link>
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
            className="flex flex-col justify-between h-full gap-8 px-4 pb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col gap-6">
              {links.map((link) => (
                <TextLink
                  key={link.label}
                  className="no-underline text-xl font-normal"
                  href={"href" in link ? link.href : undefined}
                  target={"href" in link ? "_blank" : undefined}
                  to={"to" in link ? link.to : undefined}
                >
                  {link.label}
                </TextLink>
              ))}
            </div>
            <ButtonLink
              variant="cta"
              href={signinUrl}
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Sign in
            </ButtonLink>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.nav>
  );
});

const desktopLinks = [
  {
    label: "Blog",
    to: "/blog",
  },
  {
    label: "Community",
    href: discordUrl,
  },
  {
    label: "Pricing",
    to: "/pricing",
  },
  {
    label: "Documentation",
    href: docsUrl,
  },
  {
    label: "GitHub",
    href: githubRepoUrl,
  },
] as const;

const Desktop = React.forwardRef<
  HTMLElement,
  Pick<Props, "appearance" | "className">
>(function Desktop({ appearance, className }, ref) {
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isChatBubbleMounted, setIsChatBubbleMounted] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 50) setIsIntersecting(false);
      setIsScrolled(window.scrollY > 50);
      setIsChatBubbleMounted(window.scrollY < 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const separator = document.getElementById("magic-animation-separator");
    if (!separator) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.boundingClientRect.bottom < 0) return;
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(separator);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={clsx(
        "flex gap-2 items-center transition-opacity",
        pathname === "/" && isScrolled && !isIntersecting
          ? "opacity-0 pointer-events-none"
          : "opacity-100",
        className,
      )}
    >
      <nav
        ref={ref}
        className={clsx(
          "flex rounded-2xl border border-gray-6 px-2 py-2 bg-gradient-to-b transition-colors gap-2 items-center",
          appearance === "dark"
            ? "dark from-[#393939] to-[#121212]"
            : "from-gray-1 to-[#DEDEDE]",
        )}
      >
        {desktopLinks.map((link) => (
          <ButtonLink
            key={link.label}
            variant="ghost"
            size="sm"
            className="font-normal"
            href={"href" in link ? link.href : undefined}
            to={"to" in link ? link.to : undefined}
            activeProps={{
              className: "font-medium",
            }}
          >
            {link.label}
          </ButtonLink>
        ))}
        <ButtonLink variant="cta" size="sm" href={registerUrl}>
          Get started free
        </ButtonLink>
      </nav>
      {isChatBubbleMounted && pathname === "/" && (
        <div
          className={clsx(
            "flex transition-opacity",
            isScrolled ? "opacity-0 pointer-events-none" : "opacity-100",
          )}
        >
          <TypebotBubble />
        </div>
      )}
    </div>
  );
});
