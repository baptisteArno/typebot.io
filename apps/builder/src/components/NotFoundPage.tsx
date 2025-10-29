import { ArrowLeft01Icon } from "@typebot.io/ui/icons/ArrowLeft01Icon";
import { ButtonLink } from "./ButtonLink";

type Props = {
  resourceName: string;
};
export const NotFoundPage = ({ resourceName }: Props) => {
  return (
    <div className="flex justify-center items-center w-full h-screen">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <h2>404</h2>
          <p className="text-xl">{resourceName} not found.</p>
        </div>
        <ButtonLink href="/typebots">
          <ArrowLeft01Icon />
          Dashboard
        </ButtonLink>
      </div>
    </div>
  );
};
