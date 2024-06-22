type Props = {
  value: number
}

export const ProgressBar = (props: Props) => (
  <div class="sniper-progress-bar-container">
    <div
      class="sniper-progress-bar"
      style={{
        width: `${props.value}%`,
      }}
    />
  </div>
)
