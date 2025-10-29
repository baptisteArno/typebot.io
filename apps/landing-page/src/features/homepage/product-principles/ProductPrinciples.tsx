import { buttonVariants } from "@typebot.io/ui/components/Button";
import { ArrowDown01Icon } from "@typebot.io/ui/icons/ArrowDown01Icon";
import { ArrowUp01Icon } from "@typebot.io/ui/icons/ArrowUp01Icon";
import { cn } from "@typebot.io/ui/lib/cn";
import { motion } from "motion/react";
import { useState } from "react";
import threeDButton from "./assets/3d-button.png";

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
  const [openedIndex, setOpenedIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    if (openedIndex === index) return;
    setOpenedIndex(index);
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl w-full">
      <h2>We strive to create great things</h2>
      <div className="flex md:bg-white rounded-2xl gap-4 p-2 items-start border">
        <div className="flex flex-col gap-2 md:gap-0 md:pl-4 w-full">
          {data.map(({ title, content }, index) => (
            <Principle
              key={index}
              title={title}
              content={content}
              isOpened={index === openedIndex}
              isLastItem={index === data.length - 1}
              onClick={() => toggleIndex(index)}
            />
          ))}
        </div>
        <img
          src={threeDButton}
          alt="An illustration of a button in 3 dimension with the typebot logo on it"
          className="max-w-lg md:block hidden"
        />
      </div>
    </div>
  );
};

const Principle = ({
  title,
  content,
  isOpened,
  isLastItem,
  onClick,
}: {
  title: string;
  content: string;
  isOpened: boolean;
  isLastItem: boolean;
  onClick: () => void;
}) => {
  return (
    <details
      className="rounded-xl md:rounded-none md:px-0 bg-white border md:border-0 border-border cursor-pointer"
      open={isOpened}
    >
      <summary
        className="px-4 py-4 md:py-2 font-display font-medium text-2xl flex flex-col gap-3 list-none"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        <div className="flex justify-between">
          {title}
          <span
            className={cn(
              buttonVariants({ variant: "secondary", size: "icon" }),
              "shrink-0 [&_svg]:size-6",
            )}
          >
            {isOpened ? (
              <ArrowUp01Icon className="size-8" />
            ) : (
              <ArrowDown01Icon />
            )}
          </span>
        </div>

        {isLastItem ? null : <hr className="hidden md:block" />}
      </summary>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isOpened ? "auto" : 0,
          opacity: isOpened ? 1 : 0,
        }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.15 }}
      >
        <hr className="mb-4 md:hidden mx-4 border-border" />
        <p className="pb-4 mx-4">{content}</p>
      </motion.div>
    </details>
  );
};
