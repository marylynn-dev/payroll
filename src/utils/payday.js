import dayjs from "dayjs";

/**
 * Calculates the number of days until the next payday (28th of the month)
 * and returns helpful info.
 */
export function getDaysUntilPayday() {
  const today = dayjs();
  let nextPayday = dayjs().date(28);

  // If today is after the 28th, move to next month's 28th
  if (today.isAfter(nextPayday, "day")) {
    5;
    nextPayday = nextPayday.add(1, "month").date(28);
  }

  const daysRemaining = nextPayday.diff(today, "day");
  const formattedDate = nextPayday.format("MMMM D, YYYY");

  return {
    daysRemaining,
    nextPayday,
    formattedDate,
    message: daysRemaining === 0 ? "Today 🎉" : `${daysRemaining} days`,
  };
}
