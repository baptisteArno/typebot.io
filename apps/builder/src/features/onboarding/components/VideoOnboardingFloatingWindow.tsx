import { Button } from "@typebot.io/ui/components/Button";
import { Cancel01Icon } from "@typebot.io/ui/icons/Cancel01Icon";
import { useUser } from "@/features/user/hooks/useUser";
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

  if (!onboardingVideos[type] || !isOpen) return null;

  return (
    <div className="flex p-5 border shadow-xl rounded-md w-[600px] bg-gray-1 aspect-[1.5] animate-in fade-in-0 slide-in-from-bottom-4 fixed bottom-4 right-4 z-10">
      <YoutubeIframe id={onboardingVideos[type]!.youtubeId} />

      <Button
        aria-label={"Close"}
        variant="secondary"
        className="size-8 rounded-full -right-3 -top-3 absolute"
        onClick={onClose}
      >
        <Cancel01Icon />
      </Button>
    </div>
  );
};
