import { iconButtonVariants } from "@/components/IconButton";
import { TextLink } from "@/components/link";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@typebot.io/ui/icons/ChevronDownIcon";
import { ChevronUpIcon } from "@typebot.io/ui/icons/ChevronUpIcon";
import { motion } from "motion/react";
import { type ReactNode, useState } from "react";
import { discordUrl, docsUrl, privacyPolicyUrl } from "../../../constants";

const data = [
  {
    title:
      "What are the pricing plans, and what features are included in the free plan?",
    content: (
      <>
        Typebot offers flexible pricing plans to suit solo business owners,
        startups, and large companies. The{" "}
        <span className="font-bold">Free</span> plan includes unlimited
        typebots, 200 chats per month, native integrations, webhooks, custom
        Javascript & CSS, and community support. <br />
        <br /> For more details on our Starter and Pro plans, check out the{" "}
        <TextLink href="/pricing">Pricing Page</TextLink>.
      </>
    ),
  },
  {
    title:
      "How easy is it to integrate Typebot with my existing systems and platforms?",
    content: (
      <>
        Integrating Typebot with your existing systems and platforms is
        straightforward. We provide clear, step-by-step instructions to guide
        you through the process. Typebot supports a wide range of platforms,
        including WhatsApp, WordPress, Shopify, FlutterFlow, React, Next.js,
        Notion, Webflow, Framer, and many more.
      </>
    ),
  },
  {
    title:
      "What kind of AI and machine learning capabilities does Typebot offer?",
    content: (
      <>
        Typebot is AI provider agnostic, giving you the flexibility to connect
        with any AI provider of your choice. Unlike competitors that lock you
        into proprietary systems, Typebot provides the building blocks to
        integrate seamlessly with your preferred AI services. You maintain full
        control over the data you inject into the AI and the associated costs.
      </>
    ),
  },
  {
    title:
      "What kind of support and resources are available if I encounter issues or need help?",
    content: (
      <>
        If you encounter any issues or need assistance, Typebot offers several
        support and resource options:
        <ol className="list-decimal list-inside flex flex-col gap-6 py-6">
          <li>
            <TextLink href={docsUrl} target="_blank">
              Documentation
            </TextLink>
            : Our comprehensive documentation is regularly updated to cover all
            possible issues and questions. Use the search bar to quickly find
            the information you need.
          </li>
          <li>
            <TextLink href={discordUrl} target="_blank">
              Discord Community
            </TextLink>
            : Join our Discord community and ask for help or report bugs in the
            #help-and-questions channel. We strive to answer all questions
            daily, and you might find that someone else has already asked the
            same question. Use the search bar to find existing answers.
          </li>
          <li>
            <span className="font-bold">Direct Support for Subscribers</span>:
            Users on the Starter or Pro plans can reach out directly through the
            chat widget located in the bottom right corner of the app for
            priority support.
          </li>
        </ol>
      </>
    ),
  },
  {
    title: "How secure is Typebot, and how do you handle data privacy?",
    content: (
      <p>
        Typebot is committed to ensuring your data privacy and security. We
        comply with GDPR, store data in an AWS-managed database in London, and
        restrict data access to authorized users only. We do not use cookies for
        tracking or ads. <br />
        <br />
        For detailed information, please refer to the{" "}
        <TextLink href={privacyPolicyUrl} target="_blank">
          Privacy documentation
        </TextLink>
      </p>
    ),
  },
];

export const Faq = () => {
  return (
    <div className="flex flex-col gap-8 max-w-4xl">
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
