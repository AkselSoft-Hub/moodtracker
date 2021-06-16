export type FluxStandardAction<
  Type extends string,
  Payload = undefined
> = Payload extends undefined
  ? { type: Type }
  : { payload: Payload; type: Type };

type NormalizedTrackedCategory<TrackedCategory> = {
  allIds: string[];
  byId: { [id: string]: TrackedCategory & { updatedAt?: string } };
};

export type NormalizedMeditations = NormalizedTrackedCategory<Meditation>;
export type NormalizedMoods = NormalizedTrackedCategory<Mood>;

export interface Meditation {
  seconds: number;
}

export interface Mood {
  description?: string;
  exploration?: string;
  mood: number;
}

export type ServerMood = Mood & { id: string };

export interface UpdateMood {
  description?: string;
  exploration?: string;
  id: string;
  mood?: number;
}

type MoodEvent<Type extends string, Payload> = {
  createdAt: string;
  payload: Payload;
  type: Type;
};

export type AppEvent =
  | MoodEvent<"v1/meditations/create", Meditation>
  | MoodEvent<"v1/meditations/delete", string>
  | MoodEvent<"v1/moods/create", Mood>
  | MoodEvent<"v1/moods/delete", string>
  | MoodEvent<"v1/moods/update", UpdateMood>;
