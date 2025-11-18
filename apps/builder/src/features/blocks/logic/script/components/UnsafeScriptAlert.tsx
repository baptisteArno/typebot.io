import { Alert } from "@typebot.io/ui/components/Alert";
import { Button } from "@typebot.io/ui/components/Button";
import { TriangleAlertIcon } from "@typebot.io/ui/icons/TriangleAlertIcon";

export const UnsafeScriptAlert = ({
  onTrustClick,
}: {
  onTrustClick: () => void;
}) => (
  <Alert.Root variant="warning">
    <TriangleAlertIcon />
    <Alert.Description className="flex flex-col gap-2">
      <p>
        For security reasons, since this bot was imported from a potential
        untrusted source, we have disabled some access on bot preview. Only
        enable this option if you understand what the code is doing and you know
        what you are doing, otherwise it could be a security risk.
      </p>
      <Button variant="outline" onClick={onTrustClick}>
        I trust this code
      </Button>
    </Alert.Description>
  </Alert.Root>
);
