import { Plan } from "@typebot.io/prisma/enum";
import { TextLink } from "@/components/TextLink";
import { useUser } from "@/features/user/hooks/useUser";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";

type Props = {
  typebotId: string;
};
export const SuspectedTypebotBanner = ({ typebotId }: Props) => {
  const { user } = useUser();
  const { workspace } = useWorkspace();

  if (!user?.email || !workspace) return null;

  return (
    <div className="flex items-center gap-2 w-full justify-center text-sm text-center py-2 bg-red-9 z-50 text-white">
      <p className="font-bold">
        Our anti-scam system flagged your typebot. It is currently being
        reviewed manually.
        {workspace?.plan !== Plan.FREE ? (
          <>
            <br />
            If you think that&apos;s a mistake,{" "}
            <TextLink
              href={`https://typebot.co/claim-non-scam?Email=${encodeURIComponent(
                user.email,
              )}&typebotId=${typebotId}`}
            >
              contact us
            </TextLink>
            .
          </>
        ) : null}
      </p>
    </div>
  );
};
