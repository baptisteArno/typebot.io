import { useUser } from "@/features/account/hooks/useUser";
import { planToReadable } from "@/features/billing/helpers/planToReadable";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import type { BubbleProps } from "@typebot.io/js";
import { Bubble } from "@typebot.io/nextjs";
import { Plan } from "@typebot.io/prisma/enum";
import { useEffect, useState } from "react";

export const SupportBubble = (props: Omit<BubbleProps, "typebot">) => {
  const { typebot } = useTypebot();
  const { user } = useUser();
  const { workspace } = useWorkspace();

  const [lastViewedTypebotId, setLastViewedTypebotId] = useState(typebot?.id);

  useEffect(() => {
    if (!typebot?.id) return;
    if (lastViewedTypebotId === typebot?.id) return;
    setLastViewedTypebotId(typebot?.id);
  }, [lastViewedTypebotId, typebot?.id]);

  if (!workspace?.plan || workspace.plan === Plan.FREE) return null;

  return (
    <Bubble
      typebot="typebot-support"
      prefilledVariables={{
        "User ID": user?.id,
        "First name": user?.name?.split(" ")[0] ?? undefined,
        Email: user?.email ?? undefined,
        "Typebot ID": lastViewedTypebotId,
        "Avatar URL": user?.image ?? undefined,
        Plan: planToReadable(workspace?.plan),
      }}
      theme={{
        chatWindow: {
          backgroundColor: "#fff",
        },
      }}
      {...props}
    />
  );
};
