import addDays from "date-fns/addDays";
import startOfWeek from "date-fns/startOfWeek";
import {
  weekdayNarrowFormatter,
  weekdayShortFormatter,
  WEEK_OPTIONS,
} from "./formatters";

export const DESCRIPTION_MAX_LENGTH = 32;
export const MOOD_RANGE: [number, number] = [0, 10];
export const MOOD_INTEGERS = [
  ...Array(MOOD_RANGE[1] - MOOD_RANGE[0] + 1).keys(),
] as const;

// extracted from cognito and updated manually for now
// if needed we can look at automating this in the future
export const TOTAL_USERS = 48;

export const ERRORS = {
  network: "Something went wrong, check your internet connection and try again",
  specialCharacters: "This field must not contain any special characters",
  required: "Required",
} as const;

export const PATTERNS = {
  noPunctuation:
    "[^‒–—―|$&~=\\/⁄@+*!?({[\\]})<>‹›«».;:^‘’“”'\",،、`·•†‡°″¡¿※#№÷×%‰−‱¶′‴§_‖¦]*",
} as const;

export const TIME = {
  daysPerWeek: 7,
  hoursPerDay: 24,
} as const;

export const TEST_IDS = {
  addMoodPage: "add-mood-page",
  addMoodSubmitButton: "add-mood-submit-button",
  descriptionInput: "description-input",
  moodList: "mood-list",
  navButton: "nav-button",
  resetPasswordPage: "reset-password-page",
  signInLink: "sign-in-link",
  signOutButton: "sign-out-button",
  signOutConfirmButton: "sign-out-confirm-button",
  statsOverviewPage: "stats-overview-page",
};

const now = Date.now();
const startOfWeekDate = startOfWeek(now, WEEK_OPTIONS);

const weekdayDates = [
  addDays(startOfWeekDate, 0),
  addDays(startOfWeekDate, 1),
  addDays(startOfWeekDate, 2),
  addDays(startOfWeekDate, 3),
  addDays(startOfWeekDate, 4),
  addDays(startOfWeekDate, 5),
  addDays(startOfWeekDate, 6),
] as const;

type WeekdayLabels = [string, string, string, string, string, string, string];
export const WEEKDAY_LABELS_NARROW: WeekdayLabels = weekdayDates.map((date) =>
  weekdayNarrowFormatter.format(date)
) as WeekdayLabels;

export const WEEKDAY_LABELS_SHORT: WeekdayLabels = weekdayDates.map((date) =>
  weekdayShortFormatter.format(date)
) as WeekdayLabels;
