type Props = {
  secondsToWaitFor: number
}

export const executeWait = async ({ secondsToWaitFor }: Props) => {
  await new Promise((resolve) => setTimeout(resolve, secondsToWaitFor * 1000))
}
