type UploadFileProps = {
    basePath?: string;
    files: {
        file: File;
        path: string;
    }[];
    onUploadProgress?: (percent: number) => void;
};
type UrlList = (string | null)[];
export declare const uploadFiles: ({ basePath, files, onUploadProgress, }: UploadFileProps) => Promise<UrlList>;
export {};
//# sourceMappingURL=uploadFiles.d.ts.map