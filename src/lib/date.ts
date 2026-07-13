import { format, intervalToDuration } from "date-fns";

/**
 * Format a date to a specific time format
 * @param date - The date to format
 * @param fmt - The format string
 * @returns The formatted time string
 */
export const formatTime = (date: Date, fmt = "h:mm a") =>
  format(date, fmt).toLowerCase().replace(/\s/g, "");

/**
 * Get the time left until a specific date
 * @param targetDate - The date to check against
 * @returns The formatted time left string
 */

type TimeLeftOptions = {
  maxParts?: number; // how many non-zero parts to show (default 5)
  includeSeconds?: boolean; // include seconds in output (default false)
  addSuffix?: boolean; // append " left" (default true)
  labels?: Partial<
    Record<
      "years" | "months" | "days" | "hours" | "minutes" | "seconds",
      { singular: string; plural?: string }
    >
  >;
};

const DEFAULT_LABELS = {
  years: { singular: "yr", plural: "yrs" },
  months: { singular: "mo", plural: "mos" },
  days: { singular: "d", plural: "d" }, // day -> "d" (no extra s)
  hours: { singular: "hr", plural: "hrs" },
  minutes: { singular: "min", plural: "mins" },
  seconds: { singular: "s", plural: "s" },
} as const;

export function timeLeft(
  targetDate: Date | string | number,
  opts: TimeLeftOptions = {},
): string {
  const {
    maxParts = 5,
    includeSeconds = false,
    addSuffix = true,
    labels = {},
  } = opts;

  const lbl = { ...DEFAULT_LABELS, ...labels } as Required<
    typeof DEFAULT_LABELS
  >;

  const now = new Date();
  const end = new Date(targetDate);
  if (isNaN(end.getTime())) return "Invalid date";

  // If target is in the past
  if (end.getTime() <= now.getTime()) {
    return addSuffix ? "Overdue" : "0s";
  }

  const dur = intervalToDuration({ start: now, end });

  // order and pick whether seconds included
  const partsOrder: Array<
    [keyof typeof dur, { singular: string; plural: string }]
  > = [
    ["years", lbl.years],
    ["months", lbl.months],
    ["days", lbl.days],
    ["hours", lbl.hours],
    ["minutes", lbl.minutes],
  ];

  if (includeSeconds) partsOrder.push(["seconds", lbl.seconds]);

  // build non-zero parts
  const outParts: string[] = [];
  for (const [unit, unitLabel] of partsOrder) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (dur as any)[unit] as number | undefined;
    if (!val || val <= 0) continue;

    // choose singular or plural label
    const useLabel =
      val === 1
        ? unitLabel.singular
        : (unitLabel.plural ?? unitLabel.singular + "s");
    outParts.push(`${val} ${useLabel}`);

    if (outParts.length >= maxParts) break;
  }

  if (outParts.length === 0) {
    // If everything zero (rare because we checked end <= now), fallback to seconds or "0s"
    return addSuffix ? "Overdue" : "0s";
  }

  const result = outParts.join(" ");
  return addSuffix ? `${result} left` : result;
}
