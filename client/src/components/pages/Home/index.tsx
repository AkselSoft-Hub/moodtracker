import { Paper, Spinner } from "eri";
import { addDays, subDays } from "date-fns";
import { formatIsoDateInLocalTimezone, roundDateDown } from "../../../utils";
import DeviceSetupDialog from "./DeviceSetupDialog";
import GetStartedCta from "../../shared/GetStartedCta";
import { Link } from "react-router-dom";
import MoodSummaryForDay from "../Stats/MoodSummaryForDay";
import NotSignedIn from "./NotSignedIn";
import { QuickTrackNav } from "./QuickTrackNav";
import TrackedCategoriesByDay from "./TrackedCategoriesByDay";
import eventsSlice from "../../../store/eventsSlice";
import { useSelector } from "react-redux";
import userSlice from "../../../store/userSlice";

export interface HomeState {
  dayCount: number | undefined;
  page: number;
}

export default function Home() {
  const eventsHasLoadedFromServer = useSelector(
    eventsSlice.selectors.hasLoadedFromServer,
  );
  const moods = useSelector(eventsSlice.selectors.normalizedMoods);
  const userIsSignedIn = useSelector(userSlice.selectors.isSignedIn);
  const dateToday = roundDateDown(new Date());
  const dateTomorrow = addDays(dateToday, 1);

  if (!userIsSignedIn) return <NotSignedIn />;

  return (
    <Paper.Group>
      {eventsHasLoadedFromServer ? (
        moods.allIds.length ? (
          <>
            <QuickTrackNav />
            <MoodSummaryForDay
              heading={
                <Link
                  to={`/stats/days/${formatIsoDateInLocalTimezone(dateToday)}`}
                >
                  Today&apos;s summary
                </Link>
              }
              dates={[subDays(dateToday, 1), dateToday, dateTomorrow]}
            />
            <TrackedCategoriesByDay />
          </>
        ) : (
          <GetStartedCta />
        )
      ) : (
        <Spinner />
      )}
      <DeviceSetupDialog />
    </Paper.Group>
  );
}
