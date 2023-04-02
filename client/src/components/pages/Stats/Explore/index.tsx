import subDays from "date-fns/subDays";
import { Paper, Select, Spinner } from "eri";
import { roundDateUp, roundDateDown } from "../../../../utils";
import MoodChartForPeriod from "../MoodChartForPeriod";
import {
  eventsHasLoadedFromServerSelector,
  normalizedMoodsSelector,
} from "../../../../selectors";
import { useSelector } from "react-redux";
import GetStartedCta from "../../../shared/GetStartedCta";
import { TIME } from "../../../../constants";
import MoodByHourForPeriod from "../MoodByHourForPeriod";
import { dayMonthFormatter } from "../../../../formatters/dateTimeFormatters";
import MoodByWeekdayForPeriod from "../MoodByWeekdayForPeriod";
import MoodFrequencyForPeriod from "../MoodFrequencyForPeriod";
import MoodGradientForPeriod from "../MoodGradientForPeriod";
import LocationsForPeriod from "../LocationsForPeriod";
import DateRangeSelector from "../../../shared/DateRangeSelector";
import WeightChartForPeriod from "../WeightChartForPeriod";
import WeatherForPeriod from "../WeatherForPeriod";
import addDays from "date-fns/addDays";
import useMoodIdsInPeriod from "../../../hooks/useMoodIdsInPeriod";
import { useReducer } from "react";
import { FluxStandardAction } from "../../../../typeUtilities";
import MoodCloudForPeriod from "../MoodCloudForPeriod";
import MoodSummaryForPeriod from "./MoodSummaryForPeriod";
import MeditationImpactForPeriod from "../MeditationImpactForPeriod";
import MoodByLocationForPeriod from "../MoodByLocationForPeriod";

const MILLISECONDS_IN_HALF_A_DAY = TIME.millisecondsPerDay / 2;
const X_LABELS_COUNT = 4; // must be at least 2

const convertDateToLabel = (date: Date): [number, string] => [
  Number(date),
  dayMonthFormatter.format(date),
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

const DATE_RANGE_OPTIONS = [
  "Today",
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "Last half year",
  "Last year",
  "All time",
  "Custom",
] as const;
type DateRangeString = (typeof DATE_RANGE_OPTIONS)[number];

type Action =
  | FluxStandardAction<"dateFrom/set", Date>
  | FluxStandardAction<"dateRange/set", DateRangeString>
  | FluxStandardAction<"displayDateTo/set", Date>;

interface State {
  dateFrom: Date;
  dateRange: DateRangeString;
  displayDateTo: Date;
}

export default function Explore() {
  const dateNow = new Date();
  const moods = useSelector(normalizedMoodsSelector);
  const firstMoodDateRoundedDown = roundDateDown(new Date(moods.allIds[0]));
  const dateToToday = roundDateDown(dateNow);

  const calculateDateFrom = (days: number) => {
    const dateFrom = subDays(dateToToday, days - 1);
    return dateFrom < firstMoodDateRoundedDown
      ? firstMoodDateRoundedDown
      : dateFrom;
  };

  const initialState: State = {
    dateRange: `Last ${TIME.daysPerWeek} days`,
    dateFrom: calculateDateFrom(TIME.daysPerWeek),
    displayDateTo: dateToToday,
  };

  const [localState, localDispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case "dateFrom/set":
          return {
            ...state,
            dateFrom: action.payload,
            dateRange: "Custom",
          };
        case "displayDateTo/set":
          return {
            ...state,
            dateRange: "Custom",
            displayDateTo: action.payload,
          };
        case "dateRange/set":
          switch (action.payload) {
            case "All time":
              return {
                dateRange: action.payload,
                dateFrom: firstMoodDateRoundedDown,
                displayDateTo: dateToToday,
              };
            case "Custom":
              return { ...state, dateRange: action.payload };
            case "Last 7 days":
              return {
                dateRange: action.payload,
                dateFrom: calculateDateFrom(TIME.daysPerWeek),
                displayDateTo: dateToToday,
              };
            case "Last 30 days":
              return {
                dateRange: action.payload,
                dateFrom: calculateDateFrom(30),
                displayDateTo: dateToToday,
              };
            case "Last 90 days":
              return {
                dateRange: action.payload,
                dateFrom: calculateDateFrom(90),
                displayDateTo: dateToToday,
              };
            case "Last half year":
              return {
                dateRange: action.payload,
                dateFrom: calculateDateFrom(183),
                displayDateTo: dateToToday,
              };
            case "Last year":
              return {
                dateRange: action.payload,
                dateFrom: calculateDateFrom(365),
                displayDateTo: dateToToday,
              };
            case "Today":
              return {
                dateRange: action.payload,
                dateFrom: dateToToday,
                displayDateTo: dateToToday,
              };
          }
      }
    },
    initialState
  );

  const eventsHasLoadedFromServer = useSelector(
    eventsHasLoadedFromServerSelector
  );

  const dateTo = addDays(localState.displayDateTo, 1);
  const moodIdsInPeriod = useMoodIdsInPeriod(localState.dateFrom, dateTo);

  if (!eventsHasLoadedFromServer) return <Spinner />;
  if (!moods.allIds.length)
    return (
      <Paper.Group>
        <GetStartedCta />
      </Paper.Group>
    );

  const domain: [number, number] = [
    localState.dateFrom.getTime(),
    dateTo.getTime(),
  ];
  const xLabels = createXLabels(domain, dateNow.getTime());

  return (
    <Paper.Group>
      <Paper>
        <h2>Explore</h2>
        <MoodGradientForPeriod dateFrom={localState.dateFrom} dateTo={dateTo} />
        <Select
          label="Date range"
          onChange={(e) =>
            localDispatch({
              payload: e.target.value as DateRangeString,
              type: "dateRange/set",
            })
          }
          value={localState.dateRange}
        >
          {DATE_RANGE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <DateRangeSelector
          dateFrom={localState.dateFrom}
          dateTo={localState.displayDateTo}
          setDateFrom={(payload) =>
            localDispatch({ payload, type: "dateFrom/set" })
          }
          setDateTo={(payload) =>
            localDispatch({ payload, type: "displayDateTo/set" })
          }
        />
      </Paper>
      <MoodSummaryForPeriod
        dateFrom={localState.dateFrom}
        dateTo={localState.displayDateTo}
      />
      {moodIdsInPeriod.length ? (
        <>
          <MoodChartForPeriod
            dateFrom={localState.dateFrom}
            hidePoints
            dateTo={dateTo}
            xLabels={xLabels}
          />
          <MoodByWeekdayForPeriod
            dateFrom={localState.dateFrom}
            dateTo={dateTo}
          />
          <MoodByHourForPeriod dateFrom={localState.dateFrom} dateTo={dateTo} />
          <MoodCloudForPeriod dateFrom={localState.dateFrom} dateTo={dateTo} />
          <MoodFrequencyForPeriod
            dateFrom={localState.dateFrom}
            dateTo={dateTo}
          />
          <MoodByLocationForPeriod
            dateFrom={localState.dateFrom}
            dateTo={dateTo}
          />
          <WeatherForPeriod
            dateFrom={localState.dateFrom}
            dateTo={dateTo}
            xLabels={xLabels}
          />
        </>
      ) : null}
      <WeightChartForPeriod
        dateFrom={localState.dateFrom}
        dateTo={dateTo}
        xLabels={createXLabels(domain, dateNow.getTime())}
      />
      <MeditationImpactForPeriod
        dateFrom={localState.dateFrom}
        dateTo={dateTo}
      />
      <LocationsForPeriod dateFrom={localState.dateFrom} dateTo={dateTo} />
    </Paper.Group>
  );
}
