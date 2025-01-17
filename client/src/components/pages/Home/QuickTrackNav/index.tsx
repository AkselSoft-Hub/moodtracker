import "./style.css";
import { Button, Icon, Paper } from "eri";
import { TEST_IDS } from "../../../../constants";
import { useNavigate } from "react-router-dom";

export function QuickTrackNav() {
  const navigate = useNavigate();

  return (
    <Paper data-test-id={TEST_IDS.moodList}>
      <h2>Home</h2>
      <div className="quick-track-nav__links">
        <Button onClick={() => navigate("/add")}>
          <Icon margin="end" name="heart" />
          Add mood
        </Button>
        <Button onClick={() => navigate("/sleep/add")}>
          <Icon margin="end" name="moon" />
          Add sleep
        </Button>
        <Button onClick={() => navigate("/weight/add")}>
          <Icon margin="end" name="weight" />
          Add weight
        </Button>
        <Button onClick={() => navigate("/meditation")}>
          <Icon margin="end" name="bell" />
          Meditate
        </Button>
        <Button onClick={() => navigate("/push-ups/add")}>
          <span className="m-quick-track-nav__icon">💪</span>
          Add push-ups
        </Button>
      </div>
    </Paper>
  );
}
