import { useEffect } from 'react'

const usePrefetchImages = (imageUrls: string[]) => {
  useEffect(() => {
    imageUrls.forEach((url) => {
      const img = new Image()
      img.src = url
    })
  }, [imageUrls])
}

export default usePrefetchImages
