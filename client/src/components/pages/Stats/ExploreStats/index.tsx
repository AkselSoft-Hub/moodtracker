import * as React from "react";
import subDays from "date-fns/subDays";
import addDays from "date-fns/addDays";
import { Paper, Spinner, DateField } from "eri";
import {
  roundDateUp,
  roundDateDown,
  isoDateFromIsoDateAndTime,
  formatIsoDateInLocalTimezone,
} from "../../../../utils";
import MoodChartForPeriod from "../MoodChartForPeriod";
import {
  appIsStorageLoadingSelector,
  eventsSelector,
  normalizedMoodsSelector,
} from "../../../../selectors";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "@reach/router";
import AverageMoodByHour from "./AverageMoodByHour";
import useRedirectUnauthed from "../../../hooks/useRedirectUnauthed";
import AddFirstMoodCta from "../../../shared/AddFirstMoodCta";
import { DAYS_PER_WEEK } from "../../../../constants";

const MILLISECONDS_IN_A_DAY = 86400000;
const MILLISECONDS_IN_HALF_A_DAY = MILLISECONDS_IN_A_DAY / 2;
const X_LABELS_COUNT = 4; // must be at least 2

const convertDateToLabel = (date: Date): [number, string] => [
  Number(date),
  dateFormatter.format(date),
];

const createXLabels = (
  domain: [number, number],
  now: number
): [number, string][] => {
  const labels: [number, string][] = [];

  labels.push(convertDateToLabel(roundDateUp(new Date(domain[0]))));

  const roundFn =
    now - roundDateDown(new Date(now)).getTime() < MILLISECONDS_IN_HALF_A_DAY
      ? roundDateUp
      : roundDateDown;

  for (let i = 1; i < X_LABELS_COUNT - 1; i++) {
    const label = convertDateToLabel(
      roundFn(
        new Date(
          domain[0] + ((domain[1] - domain[0]) * i) / (X_LABELS_COUNT - 1)
        )
      )
    );
    if (!labels.some(([x]) => x === label[0])) labels.push(label);
  }

  const label = convertDateToLabel(roundDateDown(new Date(domain[1])));
  if (!labels.some(([x]) => x === label[0])) labels.push(label);
  return labels;
};

const dateFormatter = Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
});

export default function ExploreStats(_: RouteComponentProps) {
  useRedirectUnauthed();
  const dateNow = new Date();
  const [dateFrom, setDateFrom] = React.useState(
    roundDateDown(subDays(dateNow, DAYS_PER_WEEK))
  );
  const maxDate = roundDateUp(dateNow);
  const [dateTo, setDateTo] = React.useState(maxDate);
  const events = useSelector(eventsSelector);
  const moods = useSelector(normalizedMoodsSelector);

  if (useSelector(appIsStorageLoadingSelector)) return <Spinner />;

  if (!events.hasLoadedFromServer) return <Spinner />;
  if (!moods.allIds.length)
    return (
      <Paper.Group>
        <AddFirstMoodCta />
      </Paper.Group>
    );

  const domain: [number, number] = [
    new Date(dateFrom).getTime(),
    new Date(dateTo).getTime(),
  ];

  return (
    <Paper.Group>
      <Paper>
        <h2>Mood chart</h2>
        <MoodChartForPeriod
          fromDate={new Date(dateFrom)}
          hidePoints
          toDate={new Date(dateTo)}
          xLabels={createXLabels(domain, dateNow.getTime())}
        />
        <DateField
          label="From"
          max={formatIsoDateInLocalTimezone(subDays(dateTo, 1))}
          min={isoDateFromIsoDateAndTime(moods.allIds[0])}
          onChange={(e) => {
            const date = new Date(e.target.value);
            if (
              date < roundDateDown(dateTo) &&
              date >= roundDateDown(new Date(moods.allIds[0]))
            )
              setDateFrom(new Date(e.target.value));
          }}
          value={formatIsoDateInLocalTimezone(dateFrom)}
        />
        <DateField
          label="To"
          max={formatIsoDateInLocalTimezone(maxDate)}
          min={formatIsoDateInLocalTimezone(addDays(dateFrom, 1))}
          onChange={(e) => {
            const date = new Date(e.target.value);
            if (date > dateFrom && date <= maxDate)
              setDateTo(new Date(e.target.value));
          }}
          value={formatIsoDateInLocalTimezone(dateTo)}
        />
      </Paper>
      <AverageMoodByHour />
    </Paper.Group>
  );
}
