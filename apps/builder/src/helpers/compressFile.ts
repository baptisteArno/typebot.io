import imageCompression from 'browser-image-compression'

export const compressFile = async (file: File) => {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1600,
  }
  return ['image/jpg', 'image/jpeg', 'image/png'].includes(file.type)
    ? imageCompression(file, options)
    : file
}
