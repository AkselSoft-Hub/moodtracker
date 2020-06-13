import { Link, NavigateFn, RouteComponentProps } from "@reach/router";
import { Paper, Fab, Icon, Button } from "eri";
import * as React from "react";
import { DispatchContext, StateContext } from "../AppState";

export default function Home({ navigate }: RouteComponentProps) {
  const dispatch = React.useContext(DispatchContext);
  const state = React.useContext(StateContext);
  return (
    <Paper.Group>
      {state.userEmail ? (
        <Paper>
          <h2>Moods</h2>
          {state.moods.allIds.length ? (
            <ul>
              {state.moods.allIds.map((id) => {
                const mood = state.moods.byId[id];
                return (
                  <li key={id}>
                    {new Date(id).toLocaleString()}: {mood.mood}{" "}
                    <Button.Group>
                      <Button
                        onClick={() => (navigate as NavigateFn)(`edit/${id}`)}
                        variant="secondary"
                      >
                        Edit
                      </Button>
                      <Button
                        danger
                        onClick={() =>
                          dispatch({
                            type: "events/add",
                            payload: {
                              type: "v1/moods/delete",
                              createdAt: new Date().toISOString(),
                              payload: id,
                            },
                          })
                        }
                        variant="secondary"
                      >
                        Delete
                      </Button>
                    </Button.Group>
                  </li>
                );
              })}
            </ul>
          ) : (
            <>
              <p>Welcome to MoodTracker!</p>
              <p>
                <Link to="add">Click here to add your first mood</Link>
              </p>
            </>
          )}
          <Fab
            aria-label="add new mood"
            onClick={() => (navigate as NavigateFn)("add")}
          >
            <Icon name="plus" size="4" />
          </Fab>
        </Paper>
      ) : (
        <Paper>
          <h2>Welcome to MoodTracker!</h2>
          <p>
            MoodTracker is a free and open source web app that lets you track
            your mood. It's simple to use, works offline and because it runs in
            your browser you can use it across all your devices!
          </p>
          <br />
          <p e-util="center">
            <strong>
              <Link to="sign-up">Sign up now to get started!</Link>
            </strong>
          </p>
          <br />
          <p>
            <small>
              If you already have an account you can{" "}
              <Link to="sign-in">sign in here</Link>.
            </small>
          </p>
        </Paper>
      )}
    </Paper.Group>
  );
}
