import { chakra, Flex, HStack, VStack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { env } from "@typebot.io/env";
import { Standard } from "@typebot.io/react";
import { Button } from "@typebot.io/ui/components/Button";
import confetti from "canvas-confetti";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { ChevronLastIcon } from "@/components/icons";
import { useAcceptTermsMutation } from "@/features/user/hooks/useAcceptTermsMutation";
import { useUser } from "@/features/user/hooks/useUser";

export const OnboardingPage = () => {
  const { t } = useTranslate();
  const { replace, query } = useRouter();
  const confettiCanvaContainer = useRef<HTMLCanvasElement | null>(null);
  const confettiCanon = useRef<confetti.CreateTypes>();
  const { user, updateUser } = useUser();
  const [pendingCategories, setPendingCategories] = useState<string[]>([]);
  const [canSkipOnboarding, setCanSkipOnboarding] = useState(false);

  const acceptTermsMutation = useAcceptTermsMutation({
    onSuccess: () => {
      setCanSkipOnboarding(true);
    },
  });

  useEffect(() => {
    initConfettis();
  });

  useEffect(() => {
    if (!user?.createdAt) return;
    if (!env.NEXT_PUBLIC_ONBOARDING_TYPEBOT_ID)
      replace({ pathname: "/typebots", query });
  }, [query, replace, user?.createdAt]);

  const initConfettis = () => {
    if (!confettiCanvaContainer.current || confettiCanon.current) return;
    confettiCanon.current = confetti.create(confettiCanvaContainer.current, {
      resize: true,
      useWorker: true,
    });
  };

  const setOnboardingAnswer = async (answer: {
    message: string;
    blockId: string;
  }) => {
    const isName = answer.blockId === "f39pygb7ixqpiqj65coj0a6c";
    const isCompany = answer.blockId === "kci15d0e13gxjvn2qqycy5qf";
    const isCategories = answer.blockId === "u7afj5htbmpsmqrckulrxsge";
    const isOtherCategory = answer.blockId === "itskd3iryo0zifb23wee8h2n";
    const isReferral = answer.blockId === "zpkbure6ptz7tbhn3bj74box";
    const isOtherReferral = answer.blockId === "vgbe54n1xwax8uoc4a43n0pl";
    const isTerms = answer.blockId === "mgdnryz48pbpo8a8hisq3ux1";

    if (isTerms) {
      acceptTermsMutation.mutate();
    }
    if (isName) updateUser({ name: answer.message });
    if (isCategories) {
      const onboardingCategories = answer.message.split(", ");
      if (onboardingCategories.includes("Other"))
        setPendingCategories(onboardingCategories.filter((c) => c !== "Other"));
      else updateUser({ onboardingCategories });
    }
    if (isOtherCategory && pendingCategories) {
      updateUser({
        onboardingCategories: [...pendingCategories, answer.message],
      });
    }
    if (isCompany) {
      updateUser({ company: answer.message });
      if (confettiCanon.current) shootConfettis(confettiCanon.current);
    }
    if (isReferral) {
      if (answer.message === "Other") return;
      updateUser({ referral: answer.message });
    }
    if (isOtherReferral) updateUser({ referral: answer.message });
  };

  const skipOnboarding = () => {
    replace({ pathname: "/typebots", query });
  };

  const redirectToDashboard = () => {
    setTimeout(() => {
      replace({
        pathname: "/typebots",
        query: { ...query },
      });
    }, 2000);
  };

  if (!env.NEXT_PUBLIC_ONBOARDING_TYPEBOT_ID) return null;
  return (
    <VStack h="100vh" flexDir="column" justifyContent="center" spacing={0}>
      <HStack
        bgColor="white"
        h="60px"
        w="full"
        justifyContent="flex-end"
        px="10"
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={skipOnboarding}
          disabled={!canSkipOnboarding}
        >
          {t("skip")}
          <ChevronLastIcon />
        </Button>
      </HStack>

      <Flex w="full" h="full" justifyContent="center" alignItems="center">
        <Flex w="full" maxW="800px" rounded="lg" h="full" maxH="70vh">
          <Standard
            id="onboarding"
            typebot={env.NEXT_PUBLIC_ONBOARDING_TYPEBOT_ID}
            style={{ borderRadius: "1rem" }}
            prefilledVariables={{ Name: user?.name, Email: user?.email }}
            onEnd={redirectToDashboard}
            onAnswer={setOnboardingAnswer}
          />
        </Flex>
      </Flex>

      <chakra.canvas
        ref={confettiCanvaContainer}
        pos="fixed"
        top="0"
        left="0"
        w="full"
        h="full"
        zIndex={9999}
        pointerEvents="none"
      />
    </VStack>
  );
};

const shootConfettis = (confettiCanon: confetti.CreateTypes) => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
  };

  const fire = (
    particleRatio: number,
    opts: {
      spread: number;
      startVelocity?: number;
      decay?: number;
      scalar?: number;
    },
  ) => {
    confettiCanon(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
      }),
    );
  };

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};
