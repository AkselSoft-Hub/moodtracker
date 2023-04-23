import { useQueries, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { fetchWeather } from "../../api";
import { HIGHLY_CACHED_QUERY_OPTIONS, TIME } from "../../constants";
import { eventsByIdSelector } from "../../selectors";
import { AppEventWithLocation } from "../../types";

const getUnixTimestampRoundedToNearestHourAndInPast = (date: Date) => {
  const roundedTime =
    Math.round(date.getTime() / 1e3 / TIME.secondsPerHour) *
    TIME.secondsPerHour;
  return (
    roundedTime - (roundedTime > Date.now() / 1e3 ? TIME.secondsPerHour : 0)
  );
};

const roundQueryParameters = ({
  date,
  latitude,
  longitude,
}: {
  date: Date;
  latitude: number;
  longitude: number;
}): {
  date: number;
  latitude: string;
  longitude: string;
} => ({
  // Date is rounded to the nearest hour, although finer resolution is likely available from many stations. The rounding should increase feasibility of caching on the backend
  date: getUnixTimestampRoundedToNearestHourAndInPast(date),
  // Rounding latitude and longitude to 1 decimal place is required by the API and gives a resolution of about 10km (https://en.wikipedia.org/wiki/Decimal_degrees#Precision). More detail in API code
  latitude: latitude.toFixed(1),
  longitude: longitude.toFixed(1),
});

export const useWeatherQuery = (queryParameters: {
  date: Date;
  latitude: number;
  longitude: number;
}) =>
  useQuery(
    ["weather", roundQueryParameters(queryParameters)] as const,
    fetchWeather,
    HIGHLY_CACHED_QUERY_OPTIONS
  );

type QueryKey = [
  "weather",
  { date: number; latitude: string; longitude: string }
];

export const useWeatherQueries = (ids: string[]) => {
  const eventsById = useSelector(eventsByIdSelector);

  return useQueries({
    queries: ids.map((id) => {
      const { latitude, longitude } = (eventsById[id] as AppEventWithLocation)
        .payload.location;
      const queryKey: QueryKey = [
        "weather",
        roundQueryParameters({ date: new Date(id), latitude, longitude }),
      ];
      return {
        ...HIGHLY_CACHED_QUERY_OPTIONS,
        queryKey,
        queryFn: fetchWeather,
      };
    }),
  });
};