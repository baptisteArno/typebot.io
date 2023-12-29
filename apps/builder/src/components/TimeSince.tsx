import { T } from '@tolgee/react'

type Props = {
  date: string
}

export const TimeSince = ({ date }: Props) => {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  )

  let interval = seconds / 31536000

  if (interval > 1) {
    return (
      <T keyName="timeSince.years" params={{ count: Math.floor(interval) }} />
    )
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return (
      <T keyName="timeSince.months" params={{ count: Math.floor(interval) }} />
    )
  }
  interval = seconds / 86400
  if (interval > 1) {
    return (
      <T keyName="timeSince.days" params={{ count: Math.floor(interval) }} />
    )
  }
  interval = seconds / 3600
  if (interval > 1) {
    return (
      <T keyName="timeSince.hours" params={{ count: Math.floor(interval) }} />
    )
  }
  interval = seconds / 60
  if (interval > 1) {
    return (
      <T keyName="timeSince.minutes" params={{ count: Math.floor(interval) }} />
    )
  }
  return (
    <T keyName="timeSince.seconds" params={{ count: Math.floor(interval) }} />
  )
}
