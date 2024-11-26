"use client";

import { Progress } from "@/components/progress";
import { motion } from "framer-motion";
import Image from "next/image";
import builderDndSrc from "public/images/builder-dnd.png";
import builderScreenshotSrc from "public/images/builder-screenshot.png";
import nativeFeelingSrc from "public/images/native-feeling.png";
import { useEffect, useState } from "react";

const useCases = [
  {
    value: "marketing",
    label: "Marketing",
    imageSrc: builderScreenshotSrc,
  },
  {
    value: "support",
    label: "Support & Product",
    imageSrc: nativeFeelingSrc,
  },
  {
    value: "sales",
    label: "Sales",
    imageSrc: builderDndSrc,
  },
] as const;

export const UseCases = () => {
  const [isAutoProgressEnabled, setIsAutoProgressEnabled] = useState(true);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [currentUseCase, setCurrentUseCase] = useState<{
    index: number;
    value: number;
  }>({
    index: 0,
    value: 0,
  });
  let interval: NodeJS.Timer;

  useEffect(() => {
    interval = setInterval(() => {
      setPreviousIndex(currentUseCase.index);
      setCurrentUseCase((prev) => {
        if (prev.value < 100) {
          return { ...prev, value: prev.value + 1 };
        } else {
          return {
            index: prev.index === useCases.length - 1 ? 0 : prev.index + 1,
            value: 0,
          };
        }
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const selectUseCase = (index: number) => {
    setPreviousIndex(currentUseCase.index);
    setCurrentUseCase({ index, value: 0 });
    setIsAutoProgressEnabled(false);
    clearInterval(interval);
  };

  const getProgressValue = (index: number) => {
    if (isAutoProgressEnabled) {
      if (currentUseCase.index === index) return currentUseCase.value;
      return;
    }
    if (currentUseCase.index === index) return 100;
    return;
  };

  return (
    <div className="flex flex-col items-center gap-8 px-3">
      <div className="flex items-end gap-8">
        {useCases.map((useCase, index) => (
          <UsecaseTitle
            progressValue={getProgressValue(index)}
            onClick={() => selectUseCase(index)}
            key={useCase.value}
          >
            {useCase.label}
          </UsecaseTitle>
        ))}
      </div>
      <motion.div
        key={currentUseCase.index}
        transition={{
          type: "spring",
          bounce: 0,
          duration: 0.5,
        }}
        initial={{
          opacity: 0,
          x: previousIndex < currentUseCase.index ? 30 : -30,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
      >
        <Image
          src={useCases[currentUseCase.index].imageSrc}
          alt="Builder screenshot"
          placeholder="blur"
          className="rounded-md"
        />
      </motion.div>
    </div>
  );
};

const UsecaseTitle = ({
  children,
  progressValue,
  onClick,
}: {
  children: React.ReactNode;
  progressValue?: number;
  onClick?: () => void;
}) => (
  <div className="flex flex-col items-center gap-2" onClick={onClick}>
    <p
      className="text-base font-medium transition-opacity duration-200 ease-out text-center"
      style={{ opacity: progressValue ? 1 : 0.5 }}
    >
      {children}
    </p>
    <Progress value={progressValue ?? 0} className="w-12" />
  </div>
);
