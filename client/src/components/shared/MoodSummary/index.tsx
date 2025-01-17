import "./style.css";
import MoodSummaryItem from "./MoodSummaryItem";
import { TIME } from "../../../constants";
import eventsSlice from "../../../store/eventsSlice";
import { formatMinutesAsTimeStringShort } from "../../../formatters/formatMinutesAsTimeString";
import { oneDecimalPlaceFormatter } from "../../../formatters/numberFormatters";
import { useSelector } from "react-redux";

interface PeriodData {
  best?: number;
  mean?: number;
  meanWeight?: number;
  meanSleep?: number;
  secondsMeditated: number;
  standardDeviation?: number;
  total: number;
  totalPushUps: number;
  worst?: number;
}

interface Props {
  currentPeriod: PeriodData;
  periodType?: "day" | "month" | "week" | "year";
  previousPeriod?: PeriodData;
  showMeditationStatsOverride?: boolean;
}

export default function MoodSummary({
  currentPeriod,
  periodType,
  previousPeriod,
  showMeditationStatsOverride = false,
}: Props) {
  const showMeditationStats: boolean =
    useSelector(eventsSlice.selectors.hasMeditations) &&
    Boolean(currentPeriod.secondsMeditated || previousPeriod?.secondsMeditated);
  const showTotalMoodsRecorded: boolean = Boolean(
    currentPeriod.total || previousPeriod?.total,
  );

  return (
    <div className="m-mood-summary">
      <MoodSummaryItem
        currentValue={currentPeriod.mean}
        format={oneDecimalPlaceFormatter.format}
        displayTrendSentiment
        heading="Average mood"
        isMood
        periodType={periodType}
        previousValue={previousPeriod?.mean}
      />
      <MoodSummaryItem
        currentValue={currentPeriod.best}
        displayTrendSentiment
        heading="Best mood"
        isMood
        periodType={periodType}
        previousValue={previousPeriod?.best}
      />
      <MoodSummaryItem
        currentValue={currentPeriod.worst}
        displayTrendSentiment
        heading="Worst mood"
        isMood
        periodType={periodType}
        previousValue={previousPeriod?.worst}
      />
      {showTotalMoodsRecorded && (
        <MoodSummaryItem
          currentValue={currentPeriod.total}
          heading="Moods recorded"
          periodType={periodType}
          previousValue={previousPeriod?.total}
        />
      )}
      {Boolean(currentPeriod.standardDeviation) && (
        <MoodSummaryItem
          currentValue={currentPeriod.standardDeviation}
          format={oneDecimalPlaceFormatter.format}
          heading="Mood standard deviation"
          periodType={periodType}
          previousValue={previousPeriod?.standardDeviation}
        />
      )}
      <MoodSummaryItem
        currentValue={currentPeriod.meanSleep}
        format={formatMinutesAsTimeStringShort}
        heading={periodType === "day" ? "Sleep" : " Average sleep"}
        periodType={periodType}
        previousValue={previousPeriod?.meanSleep}
      />
      <MoodSummaryItem
        currentValue={currentPeriod.meanWeight}
        format={oneDecimalPlaceFormatter.format}
        heading="Average weight"
        periodType={periodType}
        previousValue={previousPeriod?.meanWeight}
        units="kg"
      />
      {(showMeditationStatsOverride || showMeditationStats) && (
        <MoodSummaryItem
          currentValue={
            currentPeriod.secondsMeditated /
            (currentPeriod.secondsMeditated >= TIME.secondsPerHour
              ? TIME.secondsPerHour
              : TIME.secondsPerMinute)
          }
          displayTrendSentiment
          format={oneDecimalPlaceFormatter.format}
          heading={`${
            currentPeriod.secondsMeditated >= TIME.secondsPerHour
              ? "Hours"
              : "Minutes"
          } meditated`}
          periodType={periodType}
          previousValue={
            previousPeriod
              ? previousPeriod.secondsMeditated /
                (currentPeriod.secondsMeditated >= TIME.secondsPerHour
                  ? TIME.secondsPerHour
                  : TIME.secondsPerMinute)
              : undefined
          }
        />
      )}
      {Boolean(
        previousPeriod
          ? currentPeriod.totalPushUps || previousPeriod.totalPushUps
          : currentPeriod.totalPushUps,
      ) && (
        <MoodSummaryItem
          currentValue={currentPeriod.totalPushUps}
          displayTrendSentiment
          heading="Push-ups"
          periodType={periodType}
          previousValue={previousPeriod?.totalPushUps}
        />
      )}
    </div>
  );
}
