import { useQuery } from "@tanstack/react-query";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { Paper, Spinner } from "eri";
import { usageGet } from "../../../../api";
import { REPO_ISSUES_URL, WEEKDAY_LABELS_SHORT } from "../../../../constants";
import formatDurationFromSeconds from "../../../../formatters/formatDurationFromSeconds";
import {
  integerFormatter,
  percentFormatter,
} from "../../../../formatters/numberFormatters";
import { Usage } from "../../../../types";
import ColumnChart from "../../../shared/ColumnChart";
import MoodCell from "../../../shared/MoodCell";
import UsageTable from "./UsageTable";

export default function Usage() {
  const { data, error, isError, isLoading } = useQuery(["usage"], usageGet, {
    networkMode: "offlineFirst",
  });

  const formatAsPercentageOfMaus = (n: number): string =>
    data
      ? percentFormatter.format(data.usage.MAUs ? n / data.usage.MAUs : 0)
      : "";

  const usersByJoinDateColumnChartData = [
    { label: "Less than 7 days ago", key: "<7 days" },
    { label: "Between 7 and 30 days ago", key: ">=7 & <30 days" },
    { label: "Between 30 and 60 days ago", key: ">=30 & <60 days" },
    { label: "Between 60 and 90 days ago", key: ">=60 & <90 days" },
    { label: "Between 90 and 365 days ago", key: ">=90 & <365 days" },
    { label: "More than a year ago", key: ">=365 days" },
  ] as const;

  return (
    <Paper>
      <h2>Usage</h2>
      {isLoading ? (
        <p>
          <Spinner inline margin="end" />
          Fetching the latest stats...
        </p>
      ) : isError ? (
        error instanceof Error && error.message === "500" ? (
          <p className="negative">
            Error fetching the latest usage statistics. Something has gone wrong
            on our side, if the problem persists feel free to{" "}
            <a href={REPO_ISSUES_URL} rel="noopener" target="_blank">
              raise an issue on GitHub
            </a>
            .
          </p>
        ) : (
          <p className="negative">
            Error fetching the latest usage statistics. You need an internet
            connection to fetch this data, please check and try refreshing.
          </p>
        )
      ) : (
        <>
          <p>
            In case you were interested in how other people are using
            MoodTracker you can see some anonymized usage data here. This gets
            automatically updated every day or so and was last updated{" "}
            {formatDistanceToNow(data.expires)} ago.
          </p>
          <p>
            In the below statistics, active users are defined as users who have
            tracked at least one thing over the last 30 days.
          </p>
          <h3>Active users</h3>
          <p>
            Confirmed users are users who have confirmed their email address.
          </p>
          <UsageTable
            data={[
              ["Users over the last 24 hours", data.usage.DAUs],
              ["Users over the last 7 days", data.usage.WAUs],
              ["Users over the last 30 days (active users)", data.usage.MAUs],
              ["Confirmed users", data.usage.confirmedUsers],
              [
                "New confirmed users over the last 30 days",
                data.usage.last30Days.newUsers,
              ],
              [
                "Retention of users since a month ago",
                percentFormatter.format(data.usage.CRR),
              ],
            ]}
          />
          <h3>Active users by join date</h3>
          <ColumnChart
            data={usersByJoinDateColumnChartData.map(({ key, label }) => ({
              label,
              key,
              y: data.usage.MAUFunnel[key],
              title: formatAsPercentageOfMaus(data.usage.MAUFunnel[key]),
            }))}
            rotateXLabels
            xAxisTitle="Join date"
            yAxisTitle="Active user count"
          />
          <h3>General usage</h3>
          <UsageTable
            data={[
              [
                "Average mood for all users over the last 7 days",
                // eslint-disable-next-line react/jsx-key
                <MoodCell mood={data.usage.meanMoodInLast7Days} />,
              ],
              [
                "Average mood for all users over the last 30 days",
                // eslint-disable-next-line react/jsx-key
                <MoodCell mood={data.usage.last30Days.meanMood} />,
              ],
              [
                "Total time meditated by all users over the last 30 days",
                formatDurationFromSeconds(
                  data.usage.last30Days.meditationSeconds
                ),
              ],
              [
                "Active users who have logged a meditation over the last 30 days",
                formatAsPercentageOfMaus(data.usage.meditationMAUs),
              ],
              [
                "Active users who have logged a weight over the last 30 days",
                formatAsPercentageOfMaus(data.usage.weightMAUs),
              ],
              [
                "Active users who have logged their location over the last 30 days",
                formatAsPercentageOfMaus(data.usage.locationMAUs),
              ],
              [
                "Total events recorded over the last 30 days",
                data.usage.last30Days.count,
              ],
            ]}
          />
          {data?.usage?.last28Days?.eventCountByWeekday && (
            <>
              <h3>Events by weekday</h3>
              <p>Based on the last 28 days.</p>
              <ColumnChart
                data={Object.entries(
                  data.usage.last28Days.eventCountByWeekday
                ).map(([k, y]) => {
                  const label = WEEKDAY_LABELS_SHORT[Number(k)];
                  return {
                    y,
                    label,
                    key: k,
                    title: `${label}: ${integerFormatter.format(y)}`,
                  };
                })}
                rotateXLabels
                xAxisTitle="Weekday"
                yAxisTitle="Total events"
              />
            </>
          )}
          <h3>Settings</h3>
          <UsageTable
            data={[
              [
                "Users who are signed up to weekly emails",
                data.usage.usersWithWeeklyEmails,
              ],
            ]}
          />
        </>
      )}
    </Paper>
  );
}
