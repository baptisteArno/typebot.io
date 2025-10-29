import { useTranslate } from "@tolgee/react";
import { CollaborationType } from "@typebot.io/prisma/enum";
import { Avatar } from "@typebot.io/ui/components/Avatar";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Menu } from "@typebot.io/ui/components/Menu";
import { cx } from "@typebot.io/ui/lib/cva";
import { ReadableCollaborationType } from "./ReadableCollaborationType";

type Props = {
  image?: string;
  name?: string;
  email: string;
  type: CollaborationType;
  isGuest?: boolean;
  isOwner: boolean;
  onDeleteClick: () => void;
  onChangeCollaborationType: (type: CollaborationType) => void;
};

export const CollaboratorItem = ({
  email,
  name,
  image,
  type,
  isGuest = false,
  isOwner,
  onDeleteClick,
  onChangeCollaborationType,
}: Props) => {
  const { t } = useTranslate();
  const handleEditClick = () =>
    onChangeCollaborationType(CollaborationType.WRITE);
  const handleViewClick = () =>
    onChangeCollaborationType(CollaborationType.READ);
  return (
    <Menu.Root>
      <Menu.Trigger className="rounded-md hover:bg-gray-2 transition-colors">
        <CollaboratorIdentityContent
          email={email}
          name={name}
          image={image}
          isGuest={isGuest}
          type={type}
        />
      </Menu.Trigger>
      {isOwner && (
        <Menu.Popup>
          <Menu.Item onClick={handleEditClick}>
            <ReadableCollaborationType type={CollaborationType.WRITE} />
          </Menu.Item>
          <Menu.Item onClick={handleViewClick}>
            <ReadableCollaborationType type={CollaborationType.READ} />
          </Menu.Item>
          <Menu.Item className="text-red-9" onClick={onDeleteClick}>
            {t("remove")}
          </Menu.Item>
        </Menu.Popup>
      )}
    </Menu.Root>
  );
};

export const CollaboratorIdentityContent = ({
  name,
  type,
  isGuest = false,
  image,
  email,
}: {
  name?: string;
  type: CollaborationType;
  image?: string;
  isGuest?: boolean;
  email: string;
}) => {
  const { t } = useTranslate();

  return (
    <div className="flex items-center gap-2 justify-between max-w-full py-2 px-4">
      <div className="flex items-center min-w-0 gap-3">
        <Avatar.Root className="size-12">
          <Avatar.Image src={image} alt="User" />
          <Avatar.Fallback>{name?.charAt(0)}</Avatar.Fallback>
        </Avatar.Root>
        <div className="flex flex-col gap-0 min-w-0">
          {name && <p className="text-left text-[15px]">{name}</p>}
          <p className={cx(name ? "text-sm" : undefined, "truncate")}>
            {email}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isGuest && <Badge>{t("pending")}</Badge>}
        <Badge>
          <ReadableCollaborationType type={type} />
        </Badge>
      </div>
    </div>
  );
};
