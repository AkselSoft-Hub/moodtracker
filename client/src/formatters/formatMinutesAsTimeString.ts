import { TIME } from "../constants";

export const formatMinutesAsTimeStringShort = (minutes: number): string =>
  [Math.floor(minutes / TIME.minutesPerHour), minutes % TIME.minutesPerHour]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");

export const formatMinutesAsTimeStringLong = (minutes: number): string => {
  if (!minutes) return "0 minutes";
  const hoursOnly = Math.floor(minutes / TIME.minutesPerHour);
  const hoursString: string = hoursOnly
    ? `${hoursOnly} hour${hoursOnly === 1 ? "" : "s"}`
    : "";
  const minutesOnly = minutes % TIME.minutesPerHour;
  const minutesString: string = minutesOnly
    ? `${minutesOnly} minute${minutesOnly === 1 ? "" : "s"}`
    : "";
  return [hoursString, minutesString].filter(Boolean).join(" & ");
};
[].map((n) => String(n).padStart(2, "0")).join(":");
