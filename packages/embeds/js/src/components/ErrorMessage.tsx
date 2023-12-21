type Props = {
  error: Error
}
export const ErrorMessage = (props: Props) => {
  return (
    <div class="h-full flex justify-center items-center flex-col">
      <p class="text-2xl text-center">{props.error.message}</p>
      <pre>{JSON.stringify(props.error.cause, null, 2) as string}</pre>
    </div>
  )
}
