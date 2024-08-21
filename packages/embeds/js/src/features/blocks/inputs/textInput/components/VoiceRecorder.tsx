import { createEffect, createSignal, onCleanup } from 'solid-js'
import { volumeProcessorCode } from './VolumeProcessor'
import clsx from 'clsx'
import { CloseIcon } from '@/components/icons/CloseIcon'
import { Theme } from '@typebot.io/schemas'
import { hexToRgb } from '@typebot.io/lib/hexToRgb'
import { defaultButtonsBackgroundColor } from '@typebot.io/schemas/features/typebot/theme/constants'

const barWidth = 3
const barGap = 3
const dx = 60
const initBarsHeightPercent = 10
const minDetectedVolumePercent = 5
const maxDetectedVolumePercent = 90

type Props = {
  recordingStatus: 'asking' | 'started' | 'stopped'
  buttonsTheme: NonNullable<Theme['chat']>['buttons']
  onAbortRecording: () => void
  onRecordingConfirmed: (stream: MediaStream) => void
}

export const VoiceRecorder = (props: Props) => {
  const [recordingTime, setRecordingTime] = createSignal<number>(0)
  let canvasElement: HTMLCanvasElement | undefined
  let animationFrameId: number
  let ctx: CanvasRenderingContext2D | undefined
  let audioContext: AudioContext | undefined
  let volumeNode: AudioWorkletNode | undefined
  let microphone: MediaStreamAudioSourceNode | undefined
  let stream: MediaStream | undefined
  let bars: number[] = []
  let recordTimeInterval: NodeJS.Timer | undefined
  let lastFrameTime: DOMHighResTimeStamp | undefined = undefined
  let offset = 0

  const fillRgb = hexToRgb(
    props.buttonsTheme?.backgroundColor ?? defaultButtonsBackgroundColor
  ).join(', ')

  const draw = () => {
    if (!ctx || !canvasElement || !lastFrameTime) return

    const currentTime = performance.now()
    const deltaTime = currentTime - lastFrameTime
    lastFrameTime = currentTime

    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)

    // Draw init bars
    ctx.fillStyle = `rgba(${fillRgb}, 0.2)`
    for (
      let i = 0;
      i < (canvasElement.width + barGap) / (barWidth + barGap);
      i++
    ) {
      const x = i * (barWidth + barGap) - offset
      const barHeight = canvasElement.height * (initBarsHeightPercent / 100)
      const y = (canvasElement.height - barHeight) / 2
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barHeight, 5)
      ctx.fill()
    }

    ctx.fillStyle = `rgba(${fillRgb}, 1)`
    for (let i = 0; i < bars.length; i++) {
      const x = canvasElement.width + (i + 1) * (barWidth + barGap) - offset
      const barHeight = canvasElement.height * (bars[i] / 100)
      const y = (canvasElement.height - barHeight) / 2
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barHeight, 5)
      ctx.fill()
    }

    offset += dx * (deltaTime / 1000)

    animationFrameId = requestAnimationFrame(draw)
  }

  const startRecording = async () => {
    if (!canvasElement) return

    stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    props.onRecordingConfirmed(stream)

    if (!ctx) ctx = canvasElement.getContext('2d') ?? undefined

    recordTimeInterval = setInterval(() => {
      setRecordingTime((prev) => (prev += 1))
    }, 1000)

    audioContext = new AudioContext()
    volumeNode = await loadVolumeProcessorWorklet(audioContext)

    microphone = audioContext.createMediaStreamSource(stream)

    microphone.connect(volumeNode)
    volumeNode.connect(audioContext.destination)

    volumeNode.port.onmessage = (event) => {
      const initBars = (canvasElement.width + barGap) / (barWidth + barGap)
      const shouldAddNewBar =
        (initBars + bars.length) * (barWidth + barGap) <
        canvasElement.width + offset
      if (shouldAddNewBar)
        bars.push(
          Math.min(
            Math.max(event.data, minDetectedVolumePercent),
            maxDetectedVolumePercent
          )
        )
    }

    lastFrameTime = performance.now()
    animationFrameId = requestAnimationFrame(draw)
  }

  const stopRecording = () => {
    if (ctx && canvasElement)
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)
    offset = 0
    volumeNode?.disconnect()
    volumeNode = undefined
    microphone?.disconnect()
    microphone = undefined
    audioContext?.close()
    audioContext = undefined
    stream?.getTracks().forEach((track) => track.stop())
    stream = undefined
    bars = []
    clearTimeout(recordTimeInterval)
    setRecordingTime(0)

    cancelAnimationFrame(animationFrameId)

    props.onAbortRecording()
  }

  createEffect(() => {
    if (props.recordingStatus === 'asking') {
      startRecording()
    } else if (props.recordingStatus === 'stopped') {
      stopRecording()
    }
  })

  onCleanup(() => {
    stopRecording()
  })

  return (
    <div
      class={clsx(
        'w-full gap-2 items-center transition-opacity px-2 typebot-recorder',
        props.recordingStatus === 'started'
          ? 'opacity-1 flex'
          : 'opacity-0 hidden'
      )}
    >
      <button
        class="p-0.5 rounded-full"
        on:click={stopRecording}
        aria-label="Stop recording"
      >
        <CloseIcon class="w-4" />
      </button>
      <div class="relative flex w-full">
        <canvas ref={canvasElement} class="w-full h-[56px]" />
        <div class="absolute left-gradient w-2 left-0 h-[56px]" />
        <div class="absolute right-gradient w-3 right-0 h-[56px]" />
      </div>
      <span class="time-container flex-none w-[35px] font-bold text-sm">
        {formatTimeLabel(recordingTime())}
      </span>
    </div>
  )
}

const loadVolumeProcessorWorklet = async (audioContext: AudioContext) => {
  const blob = new Blob([volumeProcessorCode], {
    type: 'application/javascript',
  })
  const volumeProcessorCodeUrl = URL.createObjectURL(blob)
  await audioContext.audioWorklet.addModule(volumeProcessorCodeUrl)
  return new AudioWorkletNode(audioContext, 'volume-processor')
}

const formatTimeLabel = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0')
  return `${minutes}:${formattedSeconds}`
}
