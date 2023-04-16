import { environment, subDomain, services } from '@octadesk-tech/services'
import Storage from '@octadesk-tech/storage'
import { loadParameterHeader } from '../helpers/headers'
import { getChatAPIURL } from '../http'
import { FileUploaderService } from './type.fileUploader'

export const uploadFile = async (): FileUploaderService => {
  const upload = (file: File) => {
    console.log(file)
    return void
  }
  //getChatAPIURL().then(
  //  chatURL =>
  //     (this.dropzoneOptions = {
  //       url: `${chatURL}/upload`,
  //       maxFilesize: this.maxFilesize,
  //       maxFiles: this.maxFiles,
  //       dictDefaultMessage: `<i class="icon icon-plus-circle"></i> <span>${this.$t(
  //         'bot.newChatBot.actions.edit.media.upload'
  //       )}</span>`,
  //       dictFileTooBig: this.$t(
  //         'bot.newChatBot.actions.edit.media.dropzone.dictFileTooBig',
  //         {
  //           maxFilesize: this.maxFilesize
  //         }
  //       ),
  //       dictResponseError: this.$t(
  //         'bot.newChatBot.actions.edit.media.dropzone.dictResponseError'
  //       ),
  //       dictCancelUpload: '',
  //       dictCancelUploadConfirmation: this.$t(
  //         'bot.newChatBot.actions.edit.media.dropzone.dictCancelUploadConfirmation'
  //       ),
  //       dictRemoveFile: '',
  //       dictInvalidFileType: this.$t(
  //         'bot.newChatBot.actions.edit.media.dropzone.dictInvalidFileType'
  //       ),
  //       dictMaxFilesExceeded: this.$t(
  //         'bot.newChatBot.actions.edit.media.dropzone.dictMaxFilesExceeded'
  //       ),
  //       addRemoveLinks: true,
  //       clickable: true,
  //       headers: {
  //         AppSubDomain: Storage.getItem('company'),
  //         'X-Requested-With': null
  //       },
  //       acceptedFiles:
  //         'image/*,audio/*,video/*,.xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf',
  //       destroyDropzone: false
  //     })
  // )
}
