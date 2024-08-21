export const volumeProcessorCode = `
const gainFactor = 3;

class VolumeProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0];
      let sum = 0;
      for (let i = 0; i < channelData.length; i++) {
        sum += channelData[i] * channelData[i];
      }
      const rms = Math.sqrt(sum / channelData.length);
      this.port.postMessage(rms * 100 * gainFactor)
    }
    return true;
  }
}

registerProcessor("volume-processor", VolumeProcessor);

`
