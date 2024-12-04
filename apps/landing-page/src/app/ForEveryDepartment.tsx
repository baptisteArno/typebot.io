"use client";

import { IconButton } from "@/components/icon-button";
import { MotionCard } from "@/components/motion-wrappers";
import { isDefined } from "@typebot.io/lib/utils";
import { CloseIcon } from "@typebot.io/ui/icons/CloseIcon";
import { PlusIcon } from "@typebot.io/ui/icons/PlusIcon";
import { motion } from "motion/react";
import Image from "next/image";
import marketingSrc from "public/images/marketing.png";
import productSrc from "public/images/product.png";
import salesSrc from "public/images/sales.png";
import { useRef, useState } from "react";
import { useClickAway } from "react-use";
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
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const [openedDepartmentIndex, setOpenedDepartmentIndex] = useState<number>();

  const openedDepartment = isDefined(openedDepartmentIndex)
    ? departments[openedDepartmentIndex]
    : undefined;

  useClickAway(dialogContentRef, () => {
    setTimeout(() => {
      setOpenedDepartmentIndex(undefined);
    }, 100);
  });

  return (
    <>
      <div className="w-full gap-12 flex flex-col items-center">
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl">Designed for every department</h2>
          <p className="text-gray-11 font-normal">
            Automate conversations throughout the entire customer journey.
          </p>
        </div>
        {departments.map((department, index) => (
          <DepartmentCard
            key={department.title}
            department={department}
            index={index}
            setOpenedDepartmentIndex={setOpenedDepartmentIndex}
            openedDepartmentIndex={openedDepartmentIndex}
            openedDepartment={openedDepartment}
          />
        ))}
      </div>
      {openedDepartment && (
        <div className="fixed size-full inset-0 bg-gray-1/80 z-10">
          <div className="absolute top-4">
            <OpenedDepartmentCard
              department={openedDepartment}
              index={openedDepartmentIndex as number}
              dialogContentRef={dialogContentRef}
              onClose={() => setOpenedDepartmentIndex(undefined)}
            />
          </div>
        </div>
      )}
    </>
  );
};

const DepartmentCard = ({
  department,
  index,
  setOpenedDepartmentIndex,
  openedDepartmentIndex,
  openedDepartment,
}: {
  department: DepartmentCardData;
  index: number;
  setOpenedDepartmentIndex: (index: number) => void;
  openedDepartmentIndex: number | undefined;
  openedDepartment: DepartmentCardData | undefined;
}) => (
  <MotionCard
    layoutId={`dep-${index}`}
    className="p-2 relative"
    onClick={() => {
      if (openedDepartment) return;
      setOpenedDepartmentIndex(index);
    }}
  >
    <motion.figure layoutId={`dep-${index}-img`}>
      <Image src={department.image.src} alt={department.image.alt} />
    </motion.figure>
    <div className="flex flex-col px-2 pb-4 gap-3">
      <motion.h2
        layoutId={`dep-${index}-heading`}
        className="text-3xl font-medium"
      >
        {department.title}
      </motion.h2>
      <motion.p layoutId={`dep-${index}-desc`} className="pr-10">
        {department.sub}
      </motion.p>
    </div>
    {openedDepartmentIndex !== index && (
      <IconButton
        aria-label="Expand department"
        variant="outline"
        className="rounded-full p-0 w-6 h-6 absolute bottom-4 right-4 opacity-0 animate-slide-fade-in"
        style={{
          animationDelay: ".5s",
          animationFillMode: "forwards",
        }}
      >
        <PlusIcon />
      </IconButton>
    )}
  </MotionCard>
);

const OpenedDepartmentCard = ({
  department,
  index,
  dialogContentRef,
  onClose,
}: {
  department: DepartmentCardData;
  index: number;
  dialogContentRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
}) => (
  <MotionCard
    ref={dialogContentRef}
    className="mx-4 p-2"
    layoutId={`dep-${index}`}
  >
    <div className="gap-4 flex flex-col">
      <IconButton
        aria-label="Close department"
        variant="secondary"
        className="absolute top-4 right-8 opacity-0 animate-slide-fade-in"
        style={{
          animationDelay: ".5s",
          animationFillMode: "forwards",
        }}
        onClick={onClose}
      >
        <CloseIcon />
      </IconButton>
      <motion.figure layoutId={`dep-${index}-img`}>
        <Image src={department.image.src} alt={department.image.alt} />
      </motion.figure>
      <div className="flex flex-col gap-8 pb-4 px-2">
        <div className="flex flex-col gap-3">
          <motion.h2
            className="text-3xl font-medium"
            layoutId={`dep-${index}-heading`}
          >
            {department.title}
          </motion.h2>
          <motion.p layoutId={`dep-${index}-desc`}>{department.sub}</motion.p>
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
