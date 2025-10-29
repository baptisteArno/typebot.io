import { Badge } from "@typebot.io/ui/components/Badge";
import { Button } from "@typebot.io/ui/components/Button";
import { useQueryState } from "nuqs";
import { Seo } from "@/components/Seo";
import { toast } from "@/lib/toast";
import { createEmailMagicLink } from "../helpers/createEmailMagicLink";

export const EmailRedirectPage = () => {
  const [redirectPath] = useQueryState("redirectPath");
  const [email] = useQueryState("email");
  const [token] = useQueryState("token");

  const redirectToMagicLink = () => {
    if (!token || !email) {
      toast({ description: "Missing token or email query params" });
      return;
    }
    window.location.assign(
      createEmailMagicLink(token, email, redirectPath ?? undefined),
    );
  };

  if (!email || !token) return null;

  return (
    <div className="flex flex-col items-center gap-2 h-screen justify-center">
      <Seo title={"Email auth confirmation"} />
      <div className="flex flex-col p-10 rounded-8 border gap-6 bg-gray-1">
        <div className="flex flex-col gap-4">
          <h2
            onClick={() => {
              throw new Error("Sentry is working");
            }}
          >
            Email authentication
          </h2>
          <p>
            You are about to login with <Badge>{email}</Badge>
          </p>
        </div>
        <Button onClick={redirectToMagicLink}>Continue</Button>
      </div>
    </div>
  );
};
