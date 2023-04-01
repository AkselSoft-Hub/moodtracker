import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MEDITATION_SEARCH_PARAM_TIME_KEY } from "../../../../../constants";
import { deviceGeolocationSelector } from "../../../../../selectors";
import { captureException } from "../../../../../sentry";
import eventsSlice from "../../../../../store/eventsSlice";
import { Meditation } from "../../../../../types";
import useKeyboardEscape from "../../../../hooks/useKeyboardEscape";
import { noSleep } from "../nosleep";
import useBell from "./useBell";
import LogMeditationDialog from "./LogMeditationDialog";
import MeditationTimerPresentation from "./MeditationTimerPresentation";
import { initialState, reducer } from "./reducer";

export default function MeditationTimer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [localState, localDispatch] = React.useReducer(reducer, initialState);
  const bell = useBell();

  const geolocation = useSelector(deviceGeolocationSelector);
  const timerDurationInSeconds = Number(
    searchParams.get(MEDITATION_SEARCH_PARAM_TIME_KEY)
  );
  const initialTime = React.useRef(Date.now());
  const roundedSecondsRemaining = Math.round(
    (localState.remainingTime ?? timerDurationInSeconds * 1e3) / 1e3
  );
  const secondsMeditated = timerDurationInSeconds - roundedSecondsRemaining;

  const onDim = React.useCallback(
    () => localDispatch({ payload: true, type: "isDimmerEnabled/set" }),
    []
  );
  const onDontLog = React.useCallback(() => {
    navigate("/meditation");
  }, [navigate]);
  const onPause = React.useCallback(() => {
    noSleep.disable();
    localDispatch({ payload: "PAUSED", type: "timerState/set" });
  }, []);
  const onPlay = React.useCallback(() => {
    noSleep.enable();
    initialTime.current =
      Date.now() + roundedSecondsRemaining * 1e3 - timerDurationInSeconds * 1e3;
    localDispatch({ payload: "TIMING", type: "timerState/set" });
  }, [roundedSecondsRemaining, timerDurationInSeconds]);
  const onReveal = React.useCallback(
    () => localDispatch({ payload: false, type: "isDimmerEnabled/set" }),
    []
  );

  const onCloseDialog = React.useCallback(() => {
    localDispatch({ payload: false, type: "isDialogOpen/set" });
    onPlay();
  }, [onPlay]);
  const onFinish = React.useCallback(() => {
    if (secondsMeditated) {
      localDispatch({ payload: true, type: "isDialogOpen/set" });
      onPause();
    } else onDontLog();
  }, [onDontLog, onPause, secondsMeditated]);
  const onLog = React.useCallback(() => {
    const payload: Meditation = { seconds: Math.round(secondsMeditated) };
    if (geolocation) payload.location = geolocation;

    let createdAt: string;
    if (localState.timeFinished)
      createdAt = localState.timeFinished.toISOString();
    else {
      captureException(
        Error(
          "Problem logging meditation: Expected finish time to be defined, falling back to log time instead"
        )
      );
      createdAt = new Date().toISOString();
    }
    dispatch(
      eventsSlice.actions.add({
        type: "v1/meditations/create",
        createdAt,
        payload,
      })
    );
    onDontLog();
  }, [
    dispatch,
    geolocation,
    onDontLog,
    localState.timeFinished,
    secondsMeditated,
  ]);

  useKeyboardEscape(() =>
    localDispatch({ payload: false, type: "isDimmerEnabled/set" })
  );

  React.useEffect(() => {
    noSleep.enable();
    return () => {
      bell?.stop();
      noSleep.disable();
    };
  }, [bell]);

  React.useEffect(() => {
    let abort = false;
    requestAnimationFrame(function update() {
      if (
        localState.timerState === "FINISHED" ||
        localState.timerState === "PAUSED" ||
        abort
      )
        return;
      requestAnimationFrame(update);
      const t =
        timerDurationInSeconds * 1e3 - (Date.now() - initialTime.current);
      if (t > 0)
        return localDispatch({ payload: t, type: "remainingTime/set" });

      localDispatch({ payload: new Date(), type: "timeFinished/set" });
      bell?.start();
      noSleep.disable();
    });
    return () => void (abort = true);
  }, [
    bell,
    localState.isDimmerEnabled,
    timerDurationInSeconds,
    localState.timerState,
  ]);

  if (!searchParams.has(MEDITATION_SEARCH_PARAM_TIME_KEY)) {
    navigate("/");
    return null;
  }

  return (
    <>
      <MeditationTimerPresentation
        dimmed={localState.isDimmerEnabled}
        onDim={onDim}
        onDontLog={onDontLog}
        onFinish={onFinish}
        onPause={onPause}
        onPlay={onPlay}
        onLog={onLog}
        onReveal={onReveal}
        roundedSecondsRemaining={roundedSecondsRemaining}
        timerState={localState.timerState}
        totalSeconds={timerDurationInSeconds}
      />
      <LogMeditationDialog
        onClose={onCloseDialog}
        onDontLog={onDontLog}
        onLog={onLog}
        open={localState.isDialogOpen}
        secondsMeditated={secondsMeditated}
        timerDurationInSeconds={timerDurationInSeconds}
      />
    </>
  );
}