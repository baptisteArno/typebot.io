export const volumeProcessorCode = `
const throttleMs = 110;
const maxVolumePercent = 80;
const volumeMultiplier = 3;

class VolumeProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.lastUpdateTime = 0;
    this.volumeSum = 0;
    this.volumeCount = 1;
  }

  process(inputs) {
    const input = inputs[0];
    const currentTime = new Date().getTime();
    if (input.length > 0) {
      const channelData = input[0];
      let sum = 0;
      for (let i = 0; i < channelData.length; i++) {
        sum += channelData[i] * channelData[i];
      }
      const rms = Math.sqrt(sum / channelData.length);
      const volumePercent = rms * 100;
      this.volumeSum += volumePercent;
      this.volumeCount += 1;
    }
    if (currentTime - this.lastUpdateTime >= throttleMs) {
      const averageVolume = 1 + this.volumeSum / this.volumeCount;
      this.port.postMessage(Math.min(averageVolume * volumeMultiplier, maxVolumePercent));
      this.volumeSum = 0;
      this.volumeCount = 1;
      this.lastUpdateTime = currentTime;
    }
    return true;
  }
}

registerProcessor("volume-processor", VolumeProcessor);

`
