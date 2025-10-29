import { Standard } from "@typebot.io/react";
import { defaultBackgroundColor } from "@typebot.io/theme/constants";
import { Seo } from "@/components/Seo";
import { TypebotHeader } from "@/features/editor/components/TypebotHeader";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { SettingsSideMenu } from "./SettingsSideMenu";

export const SettingsPage = () => {
  const { typebot } = useTypebot();

  return (
    <div className="flex overflow-hidden h-screen flex-col">
      <Seo title={typebot?.name ? `${typebot.name} | Settings` : "Settings"} />
      <TypebotHeader />
      <div className="flex items-center w-full gap-4 h-[calc(100vh-var(--header-height))]">
        <SettingsSideMenu />
        <div className="flex flex-1 h-[calc(100%-2rem)] w-full border rounded-xl mr-4 bg-gray-1">
          {typebot && (
            <Standard
              typebot={typebot}
              style={{
                borderRadius: "0.75rem",
                width: "100%",
                height: "100%",
                backgroundColor:
                  typebot.theme.general?.background?.content ??
                  defaultBackgroundColor[typebot.version],
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
