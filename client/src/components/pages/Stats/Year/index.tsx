import { Icon, Paper, Spinner, SubHeading } from "eri";
import { useSelector } from "react-redux";
import {
  monthLongFormatter,
  monthNarrowFormatter,
  yearFormatter,
} from "../../../../dateTimeFormatters";
import {
  eventsSelector,
  normalizedMoodsSelector,
  normalizedAveragesByMonthSelector,
} from "../../../../selectors";
import {
  createDateFromLocalDateString,
  formatIsoDateInLocalTimezone,
  formatIsoMonthInLocalTimezone,
  formatIsoYearInLocalTimezone,
  getIdsInInterval,
} from "../../../../utils";
import GetStartedCta from "../../../shared/GetStartedCta";
import MoodFrequencyForPeriod from "../MoodFrequencyForPeriod";
import MoodSummaryForYear from "../MoodSummaryForYear";
import MoodByWeekdayForPeriod from "../MoodByWeekdayForPeriod";
import MoodCalendarForMonth from "../MoodCalendarForMonth";
import subYears from "date-fns/subYears";
import addYears from "date-fns/addYears";
import eachMonthOfInterval from "date-fns/eachMonthOfInterval";
import MoodByMonthChart from "./MoodByMonthChart";
import "./style.css";
import MoodByHourForPeriod from "../MoodByHourForPeriod";
import PrevNextControls from "../../../shared/PrevNextControls";
import MoodGradientForPeriod from "../MoodGradientForPeriod";
import { oneDecimalPlaceFormatter } from "../../../../numberFormatters";
import LocationsForPeriod from "../LocationsForPeriod";
import RedirectHome from "../../../RedirectHome";
import { Link, useNavigate, useParams } from "react-router-dom";
import MoodCloud from "../MoodCloud";
import MoodChartForPeriod from "../MoodChartForPeriod";
import addMonths from "date-fns/addMonths";

const isoYearRegex = /^\d{4}$/;

export default function Year() {
  const { year: yearStr } = useParams();
  const events = useSelector(eventsSelector);
  const moods = useSelector(normalizedMoodsSelector);
  const navigate = useNavigate();
  const normalizedAveragesByMonth = useSelector(
    normalizedAveragesByMonthSelector
  );

  if (!yearStr || !isoYearRegex.test(yearStr)) return <RedirectHome />;
  if (!events.hasLoadedFromServer) return <Spinner />;
  if (!moods.allIds.length)
    return (
      <Paper.Group>
        <GetStartedCta />
      </Paper.Group>
    );

  const firstMoodDate = new Date(moods.allIds[0]);

  const date = createDateFromLocalDateString(yearStr);
  const prevDate = subYears(date, 1);
  const nextDate = addYears(date, 1);

  const showPrevious = date > firstMoodDate;
  const showNext = nextDate <= new Date();

  const moodIdsInPeriod = getIdsInInterval(moods.allIds, date, nextDate);

  const months = eachMonthOfInterval({ start: date, end: nextDate }).slice(
    0,
    -1
  );

  const calendars = [];

  for (const month of months) {
    const monthString = monthLongFormatter.format(month);
    const averageMood =
      normalizedAveragesByMonth.byId[formatIsoDateInLocalTimezone(month)];
    const formattedAverageMood =
      averageMood === undefined
        ? undefined
        : oneDecimalPlaceFormatter.format(averageMood);
    calendars.push(
      <button
        aria-label={`Drill down into ${monthString}`}
        className="m-year__calendar-button br-0 p-1"
        key={String(month)}
        onClick={() =>
          navigate(`/stats/months/${formatIsoMonthInLocalTimezone(month)}`)
        }
        title={
          formattedAverageMood &&
          `Average mood for ${monthString}: ${formattedAverageMood}`
        }
      >
        <h4 className="center">
          {monthString}
          <small>{formattedAverageMood && ` (${formattedAverageMood})`}</small>
        </h4>
        <MoodCalendarForMonth month={month} small />
      </button>
    );
  }

  return (
    <Paper.Group>
      <Paper>
        <h2>{yearFormatter.format(date)}</h2>
        <MoodGradientForPeriod fromDate={date} toDate={nextDate} />
        <PrevNextControls>
          {showPrevious ? (
            <Link to={`../${formatIsoYearInLocalTimezone(prevDate)}`}>
              <Icon margin="end" name="left" />
              {yearFormatter.format(prevDate)}
            </Link>
          ) : (
            <span />
          )}
          {showNext && (
            <Link to={`../${formatIsoYearInLocalTimezone(nextDate)}`}>
              {yearFormatter.format(nextDate)}
              <Icon margin="start" name="right" />
            </Link>
          )}
        </PrevNextControls>
      </Paper>
      <MoodSummaryForYear dates={[prevDate, date, nextDate]} />
      {moodIdsInPeriod.length ? (
        <>
          <Paper>
            <h3>Mood chart</h3>
            <MoodChartForPeriod
              fromDate={date}
              toDate={nextDate}
              hidePoints
              xLabels={[...Array(12).keys()].map((n) => {
                const d = addMonths(date, n);
                return [
                  (d.getTime() + addMonths(d, 1).getTime()) / 2,
                  monthNarrowFormatter.format(d),
                ];
              })}
              xLines={[...Array(13).keys()].map((n) =>
                addMonths(date, n).getTime()
              )}
            />
          </Paper>
          <Paper>
            <h3>
              Calendar view
              <SubHeading>Tap a month to explore it in more detail</SubHeading>
            </h3>
            <div className="m-year__calendar-grid">{calendars}</div>
          </Paper>
          <Paper>
            <h3>Months</h3>
            <MoodByMonthChart months={months} />
          </Paper>
          <MoodByWeekdayForPeriod fromDate={date} toDate={nextDate} />
          <MoodByHourForPeriod fromDate={date} toDate={nextDate} />
          <MoodCloud
            currentPeriod={{ fromDate: date, toDate: nextDate }}
            previousPeriod={{ fromDate: prevDate, toDate: date }}
          />
          <MoodFrequencyForPeriod fromDate={date} toDate={nextDate} />
        </>
      ) : (
        <Paper>
          <p>No mood data for this year.</p>
        </Paper>
      )}
      <LocationsForPeriod fromDate={date} toDate={nextDate} />
    </Paper.Group>
  );
}
