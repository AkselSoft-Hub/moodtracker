import GetStartedCta from "../../shared/GetStartedCta";
import { Link } from "react-router-dom";
import { LoadingFromServerSpinner } from "../../shared/LoadingFromServerSpinner";
import Months from "./Months";
import MoodGradientForPeriod from "./MoodGradientForPeriod";
import { Paper } from "eri";
import { TEST_IDS } from "../../../constants";
import Weeks from "./Weeks";
import Years from "./Years";
import eventsSlice from "../../../store/eventsSlice";
import { useSelector } from "react-redux";

export default function Overview() {
  const eventsHasLoadedFromServer = useSelector(
    eventsSlice.selectors.hasLoadedFromServer,
  );
  const moods = useSelector(eventsSlice.selectors.normalizedMoods);

  if (!moods.allIds.length)
    return (
      <Paper.Group>
        <GetStartedCta />
      </Paper.Group>
    );

  if (!eventsHasLoadedFromServer) return <LoadingFromServerSpinner />;

  return (
    <Paper.Group data-test-id={TEST_IDS.statsOverviewPage}>
      <Paper>
        <h2>Overview</h2>
        <MoodGradientForPeriod
          dateFrom={new Date(moods.allIds[0])}
          dateTo={new Date(moods.allIds.at(-1)!)}
        />
      </Paper>
      <Weeks />
      <Months />
      <Years />
      <Paper>
        <h2 className="center">
          <Link to="explore">Explore</Link>
        </h2>
      </Paper>
    </Paper.Group>
  );
}
