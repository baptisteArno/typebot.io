import { Log } from '@typebot.io/prisma';
export declare const sanitizeUrl: (url: string) => string;
export declare const isMobile: boolean;
export declare const isEmbedded: boolean;
export declare const parseLog: (error: Error | undefined, successMessage: string, errorMessage: string) => Omit<Log, "id" | "createdAt" | "resultId">;
//# sourceMappingURL=helpers.d.ts.map