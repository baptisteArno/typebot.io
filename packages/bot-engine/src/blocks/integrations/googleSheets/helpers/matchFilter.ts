import type { GoogleSheetsGetOptions } from "@typebot.io/blocks-integrations/googleSheets/schema";
import {
  ComparisonOperators,
  LogicalOperator,
} from "@typebot.io/conditions/constants";
import { isDefined } from "@typebot.io/lib/utils";
import type { GoogleSpreadsheetRow } from "google-spreadsheet";

export const matchFilter = (
  row: GoogleSpreadsheetRow,
  filter: GoogleSheetsGetOptions["filter"],
) => {
  if (!filter) return true;
  return filter.logicalOperator === LogicalOperator.AND
    ? filter.comparisons?.every(
        (comparison) =>
          comparison.column &&
          matchComparison(
            row.get(comparison.column),
            comparison.comparisonOperator,
            comparison.value,
          ),
      )
    : filter.comparisons?.some(
        (comparison) =>
          comparison.column &&
          matchComparison(
            row.get(comparison.column),
            comparison.comparisonOperator,
            comparison.value,
          ),
      );
};

const matchComparison = (
  inputValue?: string,
  comparisonOperator?: ComparisonOperators,
  value?: string,
): boolean | undefined => {
  if (!comparisonOperator) return false;
  switch (comparisonOperator) {
    case ComparisonOperators.CONTAINS: {
      if (!inputValue || !value) return false;
      return inputValue
        .toLowerCase()
        .trim()
        .normalize()
        .includes(value.toLowerCase().trim().normalize());
    }
    case ComparisonOperators.EQUAL: {
      return inputValue?.normalize() === value?.normalize();
    }
    case ComparisonOperators.NOT_EQUAL: {
      return inputValue?.normalize() !== value?.normalize();
    }
    case ComparisonOperators.GREATER: {
      if (!inputValue || !value) return false;
      return Number.parseFloat(inputValue) > Number.parseFloat(value);
    }
    case ComparisonOperators.LESS: {
      if (!inputValue || !value) return false;
      return Number.parseFloat(inputValue) < Number.parseFloat(value);
    }
    case ComparisonOperators.IS_SET: {
      return isDefined(inputValue) && inputValue.length > 0;
    }
    case ComparisonOperators.IS_EMPTY: {
      return !isDefined(inputValue) || inputValue.length === 0;
    }
    case ComparisonOperators.STARTS_WITH: {
      if (!inputValue || !value) return false;
      return inputValue
        .toLowerCase()
        .trim()
        .normalize()
        .startsWith(value.toLowerCase().trim().normalize());
    }
    case ComparisonOperators.ENDS_WITH: {
      if (!inputValue || !value) return false;
      return inputValue
        .toLowerCase()
        .trim()
        .normalize()
        .endsWith(value.toLowerCase().trim().normalize());
    }
    case ComparisonOperators.NOT_CONTAINS: {
      if (!inputValue || !value) return false;
      return !inputValue
        ?.toLowerCase()
        .trim()
        .normalize()
        .includes(value.toLowerCase().trim().normalize());
    }
  }
};
