import * as React from "react";
import { FluxStandardAction, NormalizedEvents, AppEvent } from "../types";

type Action =
  | FluxStandardAction<"app/signOut">
  | FluxStandardAction<"app/storageLoaded">
  | FluxStandardAction<"events/add", AppEvent>
  | FluxStandardAction<"events/loadFromStorage", NormalizedEvents>
  | FluxStandardAction<"events/syncFromServer", AppEvent[]>
  | FluxStandardAction<"syncFromServer/error">
  | FluxStandardAction<"syncFromServer/start">
  | FluxStandardAction<"syncFromServer/success", string>
  | FluxStandardAction<"syncToServer/error">
  | FluxStandardAction<"syncToServer/start">
  | FluxStandardAction<"syncToServer/success">;

export interface State {
  events: NormalizedEvents;
  isStorageLoading: boolean;
  isSyncingFromServer: boolean;
  isSyncingToServer: boolean;
  syncFromServerError: boolean;
  syncToServerError: boolean;
}

export const createInitialState = (): State => ({
  events: {
    allIds: [],
    byId: {},
    hasLoadedFromServer: false,
    idsToSync: [],
    nextCursor: undefined,
  },
  isStorageLoading: true,
  isSyncingFromServer: false,
  isSyncingToServer: false,
  syncFromServerError: false,
  syncToServerError: false,
});

const initialState: State = createInitialState();

export const DispatchContext = React.createContext<React.Dispatch<Action>>(
  () => {}
);
export const StateContext = React.createContext<State>(initialState);

const getLastEvent = (normalizedState: NormalizedEvents): AppEvent => {
  if (!normalizedState.allIds.length)
    throw Error("Error: `allIds` must have length > 0");
  const lastId = normalizedState.allIds[normalizedState.allIds.length - 1];
  return normalizedState.byId[lastId];
};

export const appStateReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "app/signOut": {
      const initialState = createInitialState();
      return { ...state, events: initialState.events };
    }
    case "app/storageLoaded":
      return { ...state, isStorageLoading: false };
    case "events/add": {
      let lastEvent = state.events.allIds.length
        ? getLastEvent(state.events)
        : undefined;
      if (lastEvent && lastEvent.createdAt > action.payload.createdAt) {
        const date = new Date(lastEvent.createdAt);
        date.setUTCMilliseconds(date.getUTCMilliseconds() + 1);
        const newCreatedAt = date.toISOString();
        action.payload.createdAt = newCreatedAt;
      }
      const allIds = [...state.events.allIds, action.payload.createdAt];
      const byId = {
        ...state.events.byId,
        [action.payload.createdAt]: action.payload,
      };
      const idsToSync = [...state.events.idsToSync, action.payload.createdAt];
      const events = { ...state.events, allIds, byId, idsToSync };
      if (!lastEvent || action.payload.createdAt > lastEvent.createdAt)
        return { ...state, events };
      events.allIds.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
      return { ...state, events };
    }
    case "events/loadFromStorage":
      return { ...state, events: action.payload };
    case "events/syncFromServer": {
      if (!action.payload.length) return state;
      const byId = { ...state.events.byId };
      for (const event of action.payload) byId[event.createdAt] = event;
      const serverEventIds = action.payload.map((event) => event.createdAt);
      if (!state.events.allIds.length) {
        return {
          ...state,
          events: { ...state.events, allIds: serverEventIds, byId },
        };
      }
      const lastClientEvent = getLastEvent(state.events);
      const lastServerEvent = action.payload[action.payload.length - 1];
      const allIds = [...new Set([...state.events.allIds, ...serverEventIds])];
      const events = { ...state.events, allIds, byId };
      if (lastServerEvent.createdAt > lastClientEvent.createdAt)
        return { ...state, events };
      events.allIds.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
      return { ...state, events };
    }
    case "syncToServer/error":
      return {
        ...state,
        isSyncingToServer: false,
        syncToServerError: true,
      };
    case "syncToServer/start":
      return {
        ...state,
        isSyncingToServer: true,
        syncToServerError: false,
      };
    case "syncToServer/success":
      return {
        ...state,
        events: { ...state.events, idsToSync: [] },
        isSyncingToServer: false,
        syncToServerError: false,
      };
    case "syncFromServer/error":
      return {
        ...state,
        events: { ...state.events, hasLoadedFromServer: true },
        isSyncingFromServer: false,
        syncFromServerError: true,
      };
    case "syncFromServer/start":
      return {
        ...state,
        isSyncingFromServer: true,
        syncFromServerError: false,
      };
    case "syncFromServer/success":
      return {
        ...state,
        events: {
          ...state.events,
          hasLoadedFromServer: true,
          nextCursor: action.payload,
        },
        isSyncingFromServer: false,
        syncFromServerError: false,
      };
  }
};

export default function AppState({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(appStateReducer, initialState);
  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
}
