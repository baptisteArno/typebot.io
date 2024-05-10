import { services } from '@octadesk-tech/services'
import Storage from '@octadesk-tech/storage'
import { FileUploaderService } from './type.fileUploader'

export const fileUploader = async (): Promise<FileUploaderService> => {
  const client = await services.createClient('chatUrl')
  return {
    async upload(file): Promise<any> {
      if (file) {
        const token = Storage.getItem('userToken')
        const formData = new FormData()
        formData.append('file', file)
        return client.post('/upload', formData, {
          headers: {
            authorization: token ? `Bearer ${token}` : '',
            AppSubDomain: Storage.getItem('company'),
            'X-Requested-With': null,
          },
        })
      }
    },
  }
}

export default fileUploader
