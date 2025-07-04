import { iconButtonVariants } from "@/components/IconButton";
import { ChevronDownIcon } from "@typebot.io/ui/icons/ChevronDownIcon";
import { ChevronUpIcon } from "@typebot.io/ui/icons/ChevronUpIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { motion } from "motion/react";
import { type ReactNode, useState } from "react";

const data = [
  {
    title: "What is considered a monthly chat?",
    content: (
      <>
        A chat is counted whenever a user starts a discussion. It is independant
        of the number of messages he sends and receives. For example if a user
        starts a discussion and sends 10 messages to the bot, it will count as 1
        chat. If the user chats again later and its session is remembered, it
        will not be counted as a new chat. <br />
        <br />
        An easy way to think about it: 1 chat equals to a row in your Results
        table
      </>
    ),
  },
  {
    title: "What happens once I reach the included chats limit?",
    content: (
      <>
        That's amazing, your bots are working full speed. 🚀
        <br />
        <br />
        You will first receive a heads up email when you reach 80% of your
        included limit. Once you have reached 100%, you will receive another
        email notification.
        <br />
        <br />
        After that, your chat limit be automatically upgraded to the next tier.
      </>
    ),
  },
  {
    title: "Can I cancel or change my subscription any time?",
    content: (
      <>
        Yes, you can cancel, upgrade or downgrade your subscription at any time.
        There is no minimum time commitment or lock-in.
        <br />
        <br />
        When you upgrade or downgrade your subscription, you'll get access to
        the new options right away. Your next invoice will have a prorated
        amount.
      </>
    ),
  },
  {
    title: "Do you offer annual payments?",
    content: (
      <>
        No, because subscriptions pricing is based on chats usage, we can only
        offer monthly plans.
      </>
    ),
  },
];

export const Faq = () => {
  return (
    <div className="flex flex-col gap-8 max-w-4xl w-full">
      <h2>FAQ</h2>
      <div className="flex flex-col gap-2">
        {data.map(({ title, content }) => (
          <Question key={title} title={title}>
            {content}
          </Question>
        ))}
      </div>
    </div>
  );
};

const Question = ({
  title,
  children,
}: { title: string; children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      className="p-4 rounded-xl bg-gray-1 border border-gray-6 cursor-pointer"
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="font-heading font-medium text-2xl flex justify-between list-none md:gap-12">
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
        {children}
      </motion.div>
    </details>
  );
};
