export type FluxStandardAction<
  Type extends string,
  Payload = undefined
> = Payload extends undefined
  ? { type: Type }
  : { payload: Payload; type: Type };

export interface NormalizedEvents {
  allIds: string[];
  byId: { [id: string]: AppEvent };

  // Is false until initial load from server succeeds or errors.
  // This allows us to display a loading spinner when switching users.
  hasLoadedFromServer: boolean;
  idsToSync: string[];
  nextCursor: string | undefined;
}

export interface NormalizedMoods {
  allIds: string[];
  byId: { [id: string]: Mood & { updatedAt?: string } };
}

export interface Mood {
  mood: number;
}

type MoodEvent<Type extends string, Payload> = {
  createdAt: string;
  payload: Payload;
  type: Type;
};

export type AppEvent =
  | MoodEvent<"v1/moods/create", Mood>
  | MoodEvent<"v1/moods/delete", string>
  | MoodEvent<"v1/moods/update", Mood & { id: string }>;
