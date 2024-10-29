"use client";

import { HStack, Heading, Progress, VStack } from "@chakra-ui/react";
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
    <VStack gap={8} px="3">
      <HStack gap="8">
        {useCases.map((useCase, index) => (
          <UsecaseTitle
            progressValue={getProgressValue(index)}
            onClick={() => selectUseCase(index)}
            key={useCase.value}
          >
            {useCase.label}
          </UsecaseTitle>
        ))}
      </HStack>
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
          style={{ borderRadius: "10px" }}
        />
      </motion.div>
    </VStack>
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
  <VStack onClick={onClick}>
    <Heading
      as="p"
      textStyle="md"
      fontWeight="medium"
      transition="opacity 0.2s ease-out"
      opacity={progressValue ? 1 : 0.5}
    >
      {children}
    </Heading>
    <Progress.Root
      width="3rem"
      size="xs"
      value={progressValue ?? 0}
      rounded="lg"
      colorPalette="orange"
    >
      <Progress.Track height="5px" bgColor="rgba(13 13 13 / 10%)" shadow="none">
        <Progress.Range bgColor="orange.500" />
      </Progress.Track>
    </Progress.Root>
  </VStack>
);
