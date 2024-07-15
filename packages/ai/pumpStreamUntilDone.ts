export const pumpStreamUntilDone = async (
  controller: ReadableStreamDefaultController<Uint8Array>,
  reader: ReadableStreamDefaultReader
): Promise<void> => {
  const { done, value } = await reader.read()

  if (done) return

  controller.enqueue(value)
  return pumpStreamUntilDone(controller, reader)
}
