import { stringify } from "qs";
import useSWR from "swr";
import { fetcher } from "@/helpers/fetcher";
import type { Sheet } from "../types";

export const useSheets = ({
  credentialsId,
  spreadsheetId,
  workspaceId,
  onError,
}: {
  credentialsId?: string;
  spreadsheetId?: string;
  workspaceId?: string;
  onError?: (error: Error) => void;
}) => {
  const queryParams = stringify({ credentialsId });
  const { data, error, mutate } = useSWR<{ sheets: Sheet[] }, Error>(
    !credentialsId || !spreadsheetId || !workspaceId
      ? null
      : `/api/integrations/google-sheets/spreadsheets/${spreadsheetId}/sheets?${queryParams}`,
    fetcher,
  );
  if (error) onError && onError(error);
  return {
    sheets: data?.sheets,
    isLoading: !error && !data,
    mutate,
  };
};
