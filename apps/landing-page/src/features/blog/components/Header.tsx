import { Heading, Stack, Text } from "@chakra-ui/react";

export const formatDate = (date: string) => {
  const currentDate = new Date().getTime();
  const dateWithTimezone = date.includes("T") ? date : `${date}T00:00:00`;
  const targetDate = new Date(dateWithTimezone).getTime();
  const timeDifference = Math.abs(currentDate - targetDate);
  const daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  const fullDate = new Date(dateWithTimezone).toLocaleString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (daysAgo < 1) {
    return "Today";
  }
  if (daysAgo < 7) {
    return `${fullDate} (${daysAgo}d ago)`;
  }
  if (daysAgo < 30) {
    const weeksAgo = Math.floor(daysAgo / 7);
    return `${fullDate} (${weeksAgo}w ago)`;
  }
  if (daysAgo < 365) {
    const monthsAgo = Math.floor(daysAgo / 30);
    return `${fullDate} (${monthsAgo}mo ago)`;
  }
  const yearsAgo = Math.floor(daysAgo / 365);
  return `${fullDate} (${yearsAgo}y ago)`;
};

type Props = { children: string; date: string };
export const Header = ({ children, date }: Props) => (
  <Stack mx="auto" w="full" maxW={["full", "46rem"]} px={[3, 3, 0]}>
    <Heading>{children}</Heading>
    <Text>{formatDate(date)}</Text>
  </Stack>
);
