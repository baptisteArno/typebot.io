import { Checkbox } from "@typebot.io/ui/components/Checkbox";
import { Skeleton } from "@typebot.io/ui/components/Skeleton";

type LoadingRowsProps = {
  totalColumns: number;
};

const loadingRowKeys = Array.from(
  { length: 3 },
  (_, index) => `loading-row-${index}`,
);

const getColumnKeys = (totalColumns: number) =>
  Array.from({ length: totalColumns }, (_, index) => `loading-col-${index}`);

export const LoadingRows = ({ totalColumns }: LoadingRowsProps) => {
  const columnKeys = getColumnKeys(totalColumns);

  return (
    <>
      {loadingRowKeys.map((rowKey) => (
        <tr key={rowKey}>
          <td className="px-2 py-2 border border-gray-6 w-10">
            <div className="flex ml-1">
              <Checkbox disabled />
            </div>
          </td>
          {columnKeys.map((columnKey) => (
            <td
              className="px-4 py-2 border border-gray-6 w-full"
              key={columnKey}
            >
              <Skeleton className="h-1 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};
