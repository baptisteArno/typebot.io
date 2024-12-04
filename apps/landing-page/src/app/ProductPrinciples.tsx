"use client";

import { iconButtonVariants } from "@/components/icon-button";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@typebot.io/ui/icons/ChevronDownIcon";
import { ChevronUpIcon } from "@typebot.io/ui/icons/ChevronUpIcon";
import { motion } from "motion/react";
import { useState } from "react";

const data = [
  {
    title: "Effortless building experience",
    content:
      "Typebot makes it easy to build conversational interfaces with lots of customization options. Our flexible, scalable solution uses adaptable building blocks that fit any business need. Each block comes with great default settings but every little details can be configured to match your requirements.",
  },
  {
    title: "Extensive chat capabilities",
    content:
      "Typebot goes beyond customer support, offering versatile chat flows perfect for quizzes, surveys, creative marketing, and more. It's ideal for lead generation, internal communications, and diverse departmental needs, making it a valuable tool across your organization.",
  },
  {
    title: "Designed for human delight",
    content:
      "Experience first-class UX and beautiful interfaces with Typebot. Our easy-to-use visual flow editor helps you create engaging and lively conversations, making interactions with the tool smooth and enjoyable.",
  },
  {
    title: "Made with love for developers ",
    content:
      "Typebot is 100% open source, built with a passion for empowering developers. Our active community shares bots and features, contributing to a rich ecosystem of innovation and collaboration. Join us in shaping the future of conversational tools.",
  },
  {
    title: "Continuously evolving technology",
    content:
      "Typebot's technology is constantly evolving, with regular updates that include bug fixes, new features, and performance enhancements. We ensure that our platform stays up-to-date and reliable, providing you with the latest advancements and the best experience.",
  },
];

export const ProductPrinciples = () => {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-4xl">At Typebot, we strive to create great things</h2>
      <div className="flex flex-col gap-2">
        {data.map(({ title, content }) => (
          <Principle key={title} title={title} content={content} />
        ))}
      </div>
    </div>
  );
};

const Principle = ({ title, content }: { title: string; content: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      className="p-4 rounded-xl bg-gray-1 border border-gray-6"
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="font-heading font-medium text-2xl flex justify-between list-none">
        {title}
        <span
          className={cn(
            iconButtonVariants({ variant: "secondary" }),
            "flex-shrink-0 [&_svg]:size-6",
          )}
        >
          {isOpen ? <ChevronUpIcon className="size-8" /> : <ChevronDownIcon />}
        </span>
      </summary>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.15 }}
      >
        <hr className="my-4" />
        <p>{content}</p>
      </motion.div>
    </details>
  );
};
