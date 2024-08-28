import { Variable } from '@typebot.io/schemas';
export declare const stringContainsVariable: (str: string) => boolean;
export declare const parseVariables: (variables: Variable[], options?: {
    fieldToParse?: "value" | "id";
    escapeForJson?: boolean;
}) => (text: string | undefined) => string;
export declare const safeStringify: (val: unknown) => string | null;
export declare const parseCorrectValueType: (value: Variable["value"]) => string | (string | null)[] | boolean | number | null | undefined;
export declare const parseVariablesInObject: (object: {
    [key: string]: string | number;
}, variables: Variable[]) => {};
//# sourceMappingURL=utils.d.ts.map