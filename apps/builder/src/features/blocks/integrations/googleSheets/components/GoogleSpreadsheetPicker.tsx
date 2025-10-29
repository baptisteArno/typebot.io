import { useQuery } from "@tanstack/react-query";
import { env } from "@typebot.io/env";
import { isDefined } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { FileEmpty02Icon } from "@typebot.io/ui/icons/FileEmpty02Icon";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/queryClient";
import { GoogleSheetsLogo } from "./GoogleSheetsLogo";

declare const window: any;

type Props = {
  spreadsheetId?: string;
  credentialsId: string;
  workspaceId: string;
  onSpreadsheetIdSelect: (spreadsheetId: string) => void;
};

export const GoogleSpreadsheetPicker = ({
  spreadsheetId,
  workspaceId,
  credentialsId,
  onSpreadsheetIdSelect,
}: Props) => {
  const [isPickerInitialized, setIsPickerInitialized] = useState(false);

  const { data } = useQuery(
    trpc.sheets.getAccessToken.queryOptions({
      workspaceId,
      credentialsId,
    }),
  );
  const { data: spreadsheetData, status } = useQuery(
    trpc.sheets.getSpreadsheetName.queryOptions(
      {
        workspaceId,
        credentialsId,
        spreadsheetId: spreadsheetId as string,
      },
      { enabled: !!spreadsheetId },
    ),
  );

  useEffect(() => {
    loadScript("gapi", "https://apis.google.com/js/api.js", () => {
      window.gapi.load("picker", () => {
        setIsPickerInitialized(true);
      });
    });
  }, []);

  const loadScript = (
    id: string,
    src: string,
    callback: { (): void; (): void; (): void },
  ) => {
    const existingScript = document.getElementById(id);
    if (existingScript) {
      callback();
      return;
    }
    const script = document.createElement("script");
    script.type = "text/javascript";

    script.onload = () => {
      callback();
    };

    script.src = src;
    document.head.appendChild(script);
  };

  const createPicker = () => {
    if (!data) return;
    if (!isPickerInitialized) throw new Error("Google Picker not inited");

    const picker = new window.google.picker.PickerBuilder()
      .addView(
        new window.google.picker.View(
          window.google.picker.ViewId.SPREADSHEETS,
        ).setMimeTypes("application/vnd.google-apps.spreadsheet"),
      )
      .setOAuthToken(data.accessToken)
      .setDeveloperKey(env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY)
      .setCallback(pickerCallback)
      .build();

    picker.setVisible(true);
  };

  const pickerCallback = (data: { action: string; docs: { id: string }[] }) => {
    if (data.action !== "picked") return;
    const spreadsheetId = data.docs[0]?.id;
    if (!spreadsheetId) return;
    onSpreadsheetIdSelect(spreadsheetId);
  };

  if (spreadsheetData && spreadsheetData.name !== "")
    return (
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <GoogleSheetsLogo />
          <p className="font-medium">{spreadsheetData.name}</p>
        </div>
        <Button
          size="icon"
          onClick={createPicker}
          disabled={!isPickerInitialized}
          aria-label={"Pick another spreadsheet"}
          variant="secondary"
        >
          <FileEmpty02Icon />
        </Button>
      </div>
    );
  return (
    <Button
      onClick={createPicker}
      disabled={
        !isPickerInitialized ||
        (isDefined(spreadsheetId) && status === "pending")
      }
      variant="secondary"
      data-base-ui-click-trigger
    >
      Pick a spreadsheet
    </Button>
  );
};
