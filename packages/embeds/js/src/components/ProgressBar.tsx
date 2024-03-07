type Props = {
  value: number
}

export const ProgressBar = (props: Props) => (
  <div class="typebot-progress-bar-container">
    <div
      class="typebot-progress-bar"
      style={{
        width: `${props.value}%`,
      }}
    />
  </div>
)
