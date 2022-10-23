import * as React from "react";
import {
  Button,
  Paper,
  RadioButton,
  SubHeading,
  TextArea,
  TextField,
} from "eri";
import { useDispatch, useSelector } from "react-redux";
import eventsSlice from "../../store/eventsSlice";
import { Mood } from "../../types";
import { ERRORS, FIELDS, TEST_IDS } from "../../constants";
import useKeyboardSave from "../hooks/useKeyboardSave";
import { deviceGeolocationSelector } from "../../selectors";
import Location from "../shared/Location";
import { useNavigate } from "react-router-dom";

export default function AddMood() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [moodError, setMoodError] = React.useState<string | undefined>();
  const [descriptionError, setDescriptionError] = React.useState<
    string | undefined
  >();
  const geolocation = useSelector(deviceGeolocationSelector);
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = () => {
    const formEl = formRef.current!;
    const descriptionEl: HTMLInputElement = formEl[FIELDS.description.name];
    const descriptionValue = descriptionEl.value;
    const explorationValue: string = formEl[FIELDS.exploration.name].value;
    const moodValue: string = formEl[FIELDS.mood.name].value;

    if (!moodValue) setMoodError(ERRORS.required);

    const descriptionFieldError = descriptionEl.validity.patternMismatch;
    setDescriptionError(descriptionFieldError ? ERRORS.specialCharacters : "");

    if (descriptionFieldError || !moodValue) return;

    const payload: Mood = { mood: Number(moodValue) };
    if (descriptionValue) payload.description = descriptionValue.trim();
    if (explorationValue) payload.exploration = explorationValue.trim();
    if (geolocation) payload.location = geolocation;

    dispatch(
      eventsSlice.actions.add({
        type: "v1/moods/create",
        createdAt: new Date().toISOString(),
        payload,
      })
    );
    navigate("/");
  };

  useKeyboardSave(handleSubmit);

  const currentHour = new Date().getHours();
  const timeOfDay =
    currentHour < 4
      ? "evening"
      : currentHour < 12
      ? "morning"
      : currentHour < 17
      ? "afternoon"
      : "evening";

  return (
    <Paper.Group data-test-id={TEST_IDS.addMoodPage}>
      <Paper>
        <h2>
          Add mood
          <SubHeading>How are you feeling this {timeOfDay}?</SubHeading>
        </h2>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          ref={formRef}
        >
          <RadioButton.Group
            error={moodError}
            label={FIELDS.mood.label}
            onChange={() => {
              if (moodError) setMoodError(undefined);
            }}
          >
            {[...Array(11)].map((_, i) => (
              <RadioButton
                data-test-id={TEST_IDS.addMoodRadioButton}
                key={i}
                name={FIELDS.mood.name}
                value={i}
              >
                {i}
              </RadioButton>
            ))}
          </RadioButton.Group>
          <TextField {...FIELDS.description} error={descriptionError} />
          <TextArea {...FIELDS.exploration} />
          <Button.Group>
            <Button data-test-id={TEST_IDS.addMoodSubmitButton}>Submit</Button>
          </Button.Group>
        </form>
      </Paper>
      {geolocation && (
        <Location
          date={new Date()}
          latitude={geolocation.latitude}
          longitude={geolocation.longitude}
        />
      )}
    </Paper.Group>
  );
}
