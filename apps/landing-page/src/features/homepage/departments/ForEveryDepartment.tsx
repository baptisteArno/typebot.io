import { IconButton } from "@/components/IconButton";
import { MotionCard } from "@/components/motion-wrappers";
import { isDefined, isNotDefined } from "@typebot.io/lib/utils";
import { CloseIcon } from "@typebot.io/ui/icons/CloseIcon";
import { PlusIcon } from "@typebot.io/ui/icons/PlusIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { cx } from "@typebot.io/ui/lib/cva";
import { motion } from "motion/react";
import { useState } from "react";
import marketingSrc from "./assets/marketing.png";
import productSrc from "./assets/product.png";
import salesSrc from "./assets/sales.png";
import type { DepartmentCardData } from "./types";

const departments = [
  {
    title: "Marketing",
    sub: "Let your bot drive the conversation and turn leads into customers.",
    bulletPoints: [
      {
        main: "Lead scoring",
        sub: "Typebot asks questions while automatically scoring and prioritizing new leads.",
      },
      {
        main: "Insights",
        sub: "Engaging quizzes will help you collect visitor emails and provide valuable insights on their needs.",
      },
      {
        main: "Lead magnet",
        sub: "Provide access to valuable content in return for email addresses.",
      },
    ],
    image: {
      src: marketingSrc,
      alt: "marketing illustration",
    },
  },
  {
    title: "Support & Product",
    sub: "Deliver 24/7 multichannel support and make your customers happy.",
    bulletPoints: [
      {
        main: "Customer support",
        sub: "Qualify user requests and redirect them to the right resources.",
      },
      {
        main: "NPS Survey",
        sub: "Easily collect user feedback on your product.",
      },
      {
        main: "Customer onboarding",
        sub: "Your bot starts engaging immediately after registration to qualify new customers.",
      },
    ],
    image: {
      src: productSrc,
      alt: "Product illustration",
    },
  },
  {
    title: "Sales",
    sub: "Boost meetings and show rates with highly interested leads",
    bulletPoints: [
      {
        main: "Prospect qualification",
        sub: "Your bot scores leads based on your sales criteria and addresses FAQs 24/7.",
      },
      {
        main: "Meetings",
        sub: "Automate appointment scheduling to simplify the process for customers.",
      },
      {
        main: "Lead nurturing",
        sub: "Send instant follow-ups and other communications to keep leads engaged until they’re ready to purchase.",
      },
    ],
    image: {
      src: salesSrc,
      alt: "sales illustration",
    },
  },
] as const satisfies DepartmentCardData[];

export const ForEveryDepartment = () => {
  const [openedDepartmentIndex, setOpenedDepartmentIndex] = useState<number>();
  const [lastOpenedDepartmentIndex, setLastOpenedDepartmentIndex] = useState<
    number | undefined
  >();

  const openedDepartment = isDefined(openedDepartmentIndex)
    ? departments[openedDepartmentIndex]
    : undefined;

  return (
    <>
      <div className="w-full gap-12 flex flex-col max-w-7xl">
        <div className="flex flex-col gap-4">
          <h2>Designed for every department</h2>
          <p className="text-gray-11 font-normal">
            Automate conversations throughout the entire customer journey.
          </p>
        </div>
        <div className="flex isolate flex-col gap-4 md:gap-6 md:flex-row">
          {departments.map((department, index) => (
            <DepartmentCard
              key={department.title}
              department={department}
              index={index}
              onClick={() => {
                setOpenedDepartmentIndex(index);
              }}
              openedDepartmentIndex={openedDepartmentIndex}
              lastOpenedDepartmentIndex={lastOpenedDepartmentIndex}
            />
          ))}
        </div>
      </div>
      {openedDepartment && (
        <div className="fixed size-full inset-0 flex justify-center items-center">
          <div
            className="bg-gray-1/80 absolute inset-0 motion-preset-fade"
            onClick={() => {
              setLastOpenedDepartmentIndex(openedDepartmentIndex);
              setOpenedDepartmentIndex(undefined);
            }}
          />
          <OpenedDepartmentCard
            className="absolute"
            department={openedDepartment}
            index={openedDepartmentIndex as number}
            onClose={() => {
              setLastOpenedDepartmentIndex(openedDepartmentIndex);
              setOpenedDepartmentIndex(undefined);
            }}
          />
        </div>
      )}
    </>
  );
};

const DepartmentCard = ({
  department,
  index,
  onClick,
  openedDepartmentIndex,
  lastOpenedDepartmentIndex,
}: {
  department: DepartmentCardData;
  lastOpenedDepartmentIndex: number | undefined;
  index: number;
  onClick: () => void;
  openedDepartmentIndex: number | undefined;
  className?: string;
}) => (
  <MotionCard
    layoutId={`dep-${index}`}
    className={cx(
      "p-2 relative isolate cursor-pointer",
      lastOpenedDepartmentIndex === index &&
        isNotDefined(openedDepartmentIndex) &&
        "z-10",
    )}
    onClick={() => {
      if (isDefined(openedDepartmentIndex)) return;
      onClick();
    }}
  >
    <motion.figure layoutId={`dep-${index}-img`}>
      <img
        src={department.image.src}
        alt={department.image.alt}
        width="1035px"
        height="495px"
      />
    </motion.figure>
    <div className="flex flex-col px-2 pb-4 gap-3">
      <motion.h2
        layoutId={`dep-${index}-heading`}
        className="text-3xl font-medium"
        layout="position"
      >
        {department.title}
      </motion.h2>
      <motion.p
        layoutId={`dep-${index}-desc`}
        className="pr-10"
        layout="position"
      >
        {department.sub}
      </motion.p>
    </div>
    {openedDepartmentIndex !== index && (
      <IconButton
        aria-label="Expand department"
        variant="outline"
        className="rounded-full p-0 w-6 h-6 absolute bottom-4 right-4 motion-preset-slide-up-sm motion-delay-500"
      >
        <PlusIcon />
      </IconButton>
    )}
  </MotionCard>
);

const OpenedDepartmentCard = ({
  department,
  index,
  className,
  onClose,
}: {
  department: DepartmentCardData;
  index: number;
  className?: string;
  onClose: () => void;
}) => (
  <MotionCard
    className={cn("mx-4 p-2 max-w-xl", className)}
    layoutId={`dep-${index}`}
  >
    <div className="gap-4 flex flex-col">
      <IconButton
        aria-label="Close department"
        variant="secondary"
        className="absolute top-4 right-4 motion-preset-slide-up-sm motion-delay-500"
        onClick={onClose}
      >
        <CloseIcon />
      </IconButton>
      <motion.figure layoutId={`dep-${index}-img`}>
        <img
          src={department.image.src}
          alt={department.image.alt}
          width="1035px"
          height="495px"
        />
      </motion.figure>
      <div className="flex flex-col gap-8 pb-4 px-2">
        <div className="flex flex-col gap-3">
          <motion.h2
            className="text-3xl font-medium"
            layoutId={`dep-${index}-heading`}
            layout="position"
          >
            {department.title}
          </motion.h2>
          <motion.p layoutId={`dep-${index}-desc`} layout="position">
            {department.sub}
          </motion.p>
        </div>
        <ul className="flex flex-col gap-4 pl-4 list-inside list-disc">
          {department.bulletPoints.map((bulletPoint, index) => (
            <li className="text-md" key={index}>
              <span className="font-medium">{bulletPoint.main}:</span>{" "}
              {bulletPoint.sub}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </MotionCard>
);
