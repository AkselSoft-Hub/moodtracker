import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { NormalizedMoods } from "./types";

export const eventsIsSyncingFromServerSelector = (state: RootState) =>
  state.events.isSyncingFromServer;
export const eventsIsSyncingToServerSelector = (state: RootState) =>
  state.events.isSyncingToServer;
export const eventsSyncFromServerErrorSelector = (state: RootState) =>
  state.events.syncFromServerError;
export const eventsSyncToServerErrorSelector = (state: RootState) =>
  state.events.syncToServerError;
export const eventsSelector = (state: RootState) => state.events;
export const userEmailSelector = (state: RootState) => state.user.email;
export const userIdSelector = (state: RootState) => state.user.id;
export const userIsSignedInSelector = (state: RootState) =>
  Boolean(state.user.email);
export const userLoadingSelector = (state: RootState) => state.user.loading;

export const moodsSelector = createSelector(
  eventsSelector,
  (events): NormalizedMoods => {
    const allIds: NormalizedMoods["allIds"] = [];
    const byId: NormalizedMoods["byId"] = {};

    for (const id of events.allIds) {
      const event = events.byId[id];

      switch (event.type) {
        case "v1/moods/create":
          allIds.push(event.createdAt);
          byId[event.createdAt] = event.payload;
          break;
        case "v1/moods/delete": {
          let index: undefined | number;
          let i = allIds.length;

          while (i--)
            if (allIds[i] === event.payload) {
              index = i;
              break;
            }

          if (index === undefined) {
            console.error(
              `Delete event error - could not find mood to delete: ${JSON.stringify(
                event
              )}`
            );
            break;
          }

          allIds.splice(index, 1);
          delete byId[event.payload];
          break;
        }
        case "v1/moods/update": {
          const currentMood = byId[event.payload.id];

          // for reasons that are beyond my energy to investigate there is
          // a runtime error if you try to update the mood object directly
          byId[event.payload.id] = {
            ...currentMood,
            mood: event.payload.mood,
            updatedAt: event.createdAt,
          };
        }
      }
    }

    return { allIds, byId };
  }
);