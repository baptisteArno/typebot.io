import { Checkbox } from "@typebot.io/ui/components/Checkbox";
import { Skeleton } from "@typebot.io/ui/components/Skeleton";

type LoadingRowsProps = {
  totalColumns: number;
};

export const LoadingRows = ({ totalColumns }: LoadingRowsProps) => {
  return (
    <>
      {Array.from(Array(3)).map((_, idx) => (
        <tr key={idx}>
          <td className="px-2 py-2 border border-gray-6 w-10">
            <div className="flex ml-1">
              <Checkbox disabled />
            </div>
          </td>
          {Array.from(Array(totalColumns)).map((_, idx) => {
            return (
              <td className="px-4 py-2 border border-gray-6 w-full" key={idx}>
                <Skeleton className="h-1 w-full" />
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
};
