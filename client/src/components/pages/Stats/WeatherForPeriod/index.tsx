import { Paper, Spinner, SubHeading } from "eri";
import { integerPercentFormatter } from "../../../../formatters/numberFormatters";
import useEventIdsWithLocationInPeriod from "../../../hooks/useEventIdsWithLocationInPeriod";
import { useWeatherQueries } from "../../../hooks/useWeatherQueries";
import MoodByTemperatureForPeriod from "./MoodByTemperatureForPeriod";
import MoodByWeatherForPeriod from "./MoodByWeatherForPeriod";
import TemperatureForPeriod from "./TemperatureForPeriod";
import WeatherFrequencyForPeriod from "./WeatherFrequencyForPeriod";

interface Props {
  fromDate: Date;
  toDate: Date;
  xLabels: [number, string][];
  xLines?: number[];
}

export default function WeatherForPeriod({
  fromDate,
  toDate,
  xLabels,
  xLines,
}: Props) {
  const eventIdsWithLocationInPeriod = useEventIdsWithLocationInPeriod(
    fromDate,
    toDate
  );
  const weatherResults = useWeatherQueries(eventIdsWithLocationInPeriod);

  if (!eventIdsWithLocationInPeriod.length) return null;

  let errorCount = 0;
  let loadingCount = 0;
  let successCount = 0;

  for (let i = 0; i < weatherResults.length; i++) {
    const result = weatherResults[i];
    if (result.isError) errorCount++;
    else if (result.isLoading) loadingCount++;
    const { data } = result;
    if (!data) continue;
    successCount++;
  }

  const loadingEl =
    loadingCount || errorCount ? (
      <p>
        <small>
          {Boolean(loadingCount) && (
            <>
              <Spinner inline margin="end" />
              Fetching weather data (may require an internet connection)...{" "}
              {integerPercentFormatter.format(
                successCount / eventIdsWithLocationInPeriod.length
              )}
            </>
          )}
          {Boolean(errorCount && loadingCount) && <br />}
          {Boolean(errorCount) && (
            <span className="negative">
              Could not fetch weather for{" "}
              {integerPercentFormatter.format(
                errorCount / eventIdsWithLocationInPeriod.length
              )}{" "}
              of locations, please try again later
            </span>
          )}
        </small>
      </p>
    ) : null;

  return (
    <Paper>
      <h3>
        Weather
        <SubHeading>
          {eventIdsWithLocationInPeriod.length} location
          {eventIdsWithLocationInPeriod.length > 1 ? "s" : ""} recorded for this
          period
        </SubHeading>
      </h3>
      {loadingEl}
      <WeatherFrequencyForPeriod fromDate={fromDate} toDate={toDate} />
      {loadingEl}
      <MoodByWeatherForPeriod fromDate={fromDate} toDate={toDate} />
      {loadingEl}
      <MoodByTemperatureForPeriod fromDate={fromDate} toDate={toDate} />
      {loadingEl}
      <TemperatureForPeriod
        fromDate={fromDate}
        toDate={toDate}
        xLabels={xLabels}
        xLines={xLines}
      />
      {loadingEl}
    </Paper>
  );
}