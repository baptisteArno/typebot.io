export type FileUploaderService = {
  upload: (file: File) => Promise<any>
}
