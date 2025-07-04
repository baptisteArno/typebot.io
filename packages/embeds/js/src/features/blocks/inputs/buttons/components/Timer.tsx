import { createSignal, onCleanup, onMount } from "solid-js";

type Props = {
  timerSeconds: number;
  onTimeout: () => void;
};

export const Timer = (props: Props) => {
  const [timeLeft, setTimeLeft] = createSignal(props.timerSeconds);
  let interval: number | undefined;

  onMount(() => {
    interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          props.onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  });

  onCleanup(() => {
    if (interval) {
      clearInterval(interval);
    }
  });

  return <></>;
};
