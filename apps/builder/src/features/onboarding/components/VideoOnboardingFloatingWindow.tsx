import { CloseIcon } from "@/components/icons";
import { useUser } from "@/features/user/hooks/useUser";
import { Flex, SlideFade, useColorModeValue } from "@chakra-ui/react";
import { Button } from "@typebot.io/ui/components/Button";
import { onboardingVideos } from "../data";
import { useOnboardingDisclosure } from "../hooks/useOnboardingDisclosure";
import { YoutubeIframe } from "./YoutubeIframe";

type Props = {
  type: keyof typeof onboardingVideos;
};

export const VideoOnboardingFloatingWindow = ({ type }: Props) => {
  const { user, updateUser } = useUser();
  const { isOpen, onClose } = useOnboardingDisclosure({
    key: type,
    user,
    updateUser,
    defaultOpenDelay: 1000,
    blockDef: undefined,
  });
  const bgColor = useColorModeValue("white", "gray.950");

  if (!onboardingVideos[type]) return null;

  return (
    <SlideFade
      in={isOpen}
      offsetY="20px"
      style={{
        position: "fixed",
        bottom: "18px",
        right: "18px",
        zIndex: 42,
      }}
      unmountOnExit
    >
      <Flex
        p="5"
        bgColor={bgColor}
        borderWidth="1px"
        shadow="xl"
        rounded="md"
        aspectRatio="1.5"
        w="600px"
      >
        <YoutubeIframe id={onboardingVideos[type]!.youtubeId} />

        <Button
          aria-label={"Close"}
          variant="secondary"
          className="size-8 rounded-full -right-3 -top-3 absolute"
          onClick={onClose}
        >
          <CloseIcon />
        </Button>
      </Flex>
    </SlideFade>
  );
};
