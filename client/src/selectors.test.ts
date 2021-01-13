import {
  normalizedAveragesByMonthSelector,
  normalizedAveragesByWeekSelector,
  normalizedAveragesByYearSelector,
  moodsSelector,
  normalizedAveragesByDaySelector,
} from "./selectors";
import store, { RootState } from "./store";

describe("selectors", () => {
  let initialState: RootState;

  beforeAll(() => {
    initialState = store.getState();
  });

  describe("moodsSelector", () => {
    test("when there are no events", () => {
      expect(moodsSelector(initialState)).toEqual({
        allIds: [],
        byId: {},
      });
    });

    test("with a single create event", () => {
      expect(
        moodsSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-10-10T08:00:00.000Z"],
            byId: {
              "2020-10-10T08:00:00.000Z": {
                createdAt: "2020-10-10T08:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
            },
          },
        })
      ).toEqual({
        allIds: ["2020-10-10T08:00:00.000Z"],
        byId: { "2020-10-10T08:00:00.000Z": { mood: 5 } },
      });
    });

    test("with a delete event", () => {
      expect(
        moodsSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: [
              "2020-10-10T08:00:00.000Z",
              "2020-10-10T08:01:00.000Z",
              "2020-10-10T08:02:00.000Z",
            ],
            byId: {
              "2020-10-10T08:00:00.000Z": {
                createdAt: "2020-10-10T08:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
              "2020-10-10T08:01:00.000Z": {
                createdAt: "2020-10-10T08:01:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 8 },
              },
              "2020-10-10T08:02:00.000Z": {
                createdAt: "2020-10-10T08:02:00.000Z",
                type: "v1/moods/delete",
                payload: "2020-10-10T08:00:00.000Z",
              },
            },
          },
        })
      ).toEqual({
        allIds: ["2020-10-10T08:01:00.000Z"],
        byId: { "2020-10-10T08:01:00.000Z": { mood: 8 } },
      });
    });

    test("with an update event that changes all event properties", () => {
      expect(
        moodsSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: [
              "2020-10-10T08:00:00.000Z",
              "2020-10-10T08:01:00.000Z",
              "2020-10-10T08:02:00.000Z",
              "2020-10-10T08:03:00.000Z",
              "2020-10-10T08:04:00.000Z",
            ],
            byId: {
              "2020-10-10T08:00:00.000Z": {
                createdAt: "2020-10-10T08:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
              "2020-10-10T08:01:00.000Z": {
                createdAt: "2020-10-10T08:01:00.000Z",
                type: "v1/moods/create",
                payload: {
                  description: "happy",
                  exploration: "foo",
                  mood: 8,
                },
              },
              "2020-10-10T08:02:00.000Z": {
                createdAt: "2020-10-10T08:02:00.000Z",
                type: "v1/moods/delete",
                payload: "2020-10-10T08:00:00.000Z",
              },
              "2020-10-10T08:03:00.000Z": {
                createdAt: "2020-10-10T08:03:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 7 },
              },
              "2020-10-10T08:04:00.000Z": {
                createdAt: "2020-10-10T08:04:00.000Z",
                type: "v1/moods/update",
                payload: {
                  id: "2020-10-10T08:01:00.000Z",
                  description: "joy",
                  exploration: "bar",
                  mood: 10,
                },
              },
            },
          },
        })
      ).toEqual({
        allIds: ["2020-10-10T08:01:00.000Z", "2020-10-10T08:03:00.000Z"],
        byId: {
          "2020-10-10T08:01:00.000Z": {
            description: "joy",
            exploration: "bar",
            mood: 10,
            updatedAt: "2020-10-10T08:04:00.000Z",
          },
          "2020-10-10T08:03:00.000Z": { mood: 7 },
        },
      });
    });

    test("with an update event that changes a single property", () => {
      expect(
        moodsSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: [
              "2020-10-10T08:01:00.000Z",
              "2020-10-10T08:03:00.000Z",
              "2020-10-10T08:04:00.000Z",
            ],
            byId: {
              "2020-10-10T08:01:00.000Z": {
                createdAt: "2020-10-10T08:01:00.000Z",
                type: "v1/moods/create",
                payload: {
                  description: "happy",
                  exploration: "foo",
                  mood: 8,
                },
              },
              "2020-10-10T08:03:00.000Z": {
                createdAt: "2020-10-10T08:03:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 7 },
              },
              "2020-10-10T08:04:00.000Z": {
                createdAt: "2020-10-10T08:04:00.000Z",
                type: "v1/moods/update",
                payload: {
                  id: "2020-10-10T08:01:00.000Z",
                  description: "joy",
                },
              },
            },
          },
        })
      ).toEqual({
        allIds: ["2020-10-10T08:01:00.000Z", "2020-10-10T08:03:00.000Z"],
        byId: {
          "2020-10-10T08:01:00.000Z": {
            description: "joy",
            exploration: "foo",
            mood: 8,
            updatedAt: "2020-10-10T08:04:00.000Z",
          },
          "2020-10-10T08:03:00.000Z": { mood: 7 },
        },
      });
    });
  });

  describe("normalizedAveragesByDaySelector", () => {
    it("works with 1 mood", () => {
      expect(
        normalizedAveragesByDaySelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-10T00:00:00.000Z"],
            byId: {
              "2020-07-10T00:00:00.000Z": {
                createdAt: "2020-07-10T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
            },
          },
        })
      ).toEqual({ allIds: ["2020-07-10"], byId: { "2020-07-10": 5 } });
    });

    it("works with 2 moods in the same day", () => {
      expect(
        normalizedAveragesByDaySelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-28T00:00:00.000Z", "2020-07-28T01:00:00.000Z"],
            byId: {
              "2020-07-28T00:00:00.000Z": {
                createdAt: "2020-07-28T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
              "2020-07-28T01:00:00.000Z": {
                createdAt: "2020-07-28T01:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 7 },
              },
            },
          },
        })
      ).toEqual({ allIds: ["2020-07-28"], byId: { "2020-07-28": 6 } });
    });

    it("works with 2 moods in adjacent days", () => {
      expect(
        normalizedAveragesByDaySelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-27T00:00:00.000Z", "2020-07-28T00:00:00.000Z"],
            byId: {
              "2020-07-27T00:00:00.000Z": {
                createdAt: "2020-07-27T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
              "2020-07-28T00:00:00.000Z": {
                createdAt: "2020-07-28T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
            },
          },
        })
      ).toEqual({
        allIds: ["2020-07-27", "2020-07-28"],
        byId: { "2020-07-27": 5, "2020-07-28": 5 },
      });

      expect(
        normalizedAveragesByDaySelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-06-10T00:00:00.000Z", "2020-06-11T00:00:00.000Z"],
            byId: {
              "2020-06-10T00:00:00.000Z": {
                createdAt: "2020-06-10T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 4 },
              },
              "2020-06-11T00:00:00.000Z": {
                createdAt: "2020-06-11T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 7 },
              },
            },
          },
        })
      ).toMatchInlineSnapshot(`
        Object {
          "allIds": Array [
            "2020-06-10",
            "2020-06-11",
          ],
          "byId": Object {
            "2020-06-10": 5.5,
            "2020-06-11": 7,
          },
        }
      `);
    });

    it("works with 2 moods in separate non-adjacent days", () => {
      expect(
        normalizedAveragesByDaySelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-04-05T00:00:00.000Z", "2020-04-08T00:00:00.000Z"],
            byId: {
              "2020-04-05T00:00:00.000Z": {
                createdAt: "2020-04-05T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
              "2020-04-08T00:00:00.000Z": {
                createdAt: "2020-04-08T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
            },
          },
        })
      ).toEqual({
        allIds: ["2020-04-05", "2020-04-06", "2020-04-07", "2020-04-08"],
        byId: {
          "2020-04-05": 5,
          "2020-04-06": 5,
          "2020-04-07": 5,
          "2020-04-08": 5,
        },
      });

      expect(
        normalizedAveragesByDaySelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-04-05T00:00:00.000Z", "2020-04-09T00:00:00.000Z"],
            byId: {
              "2020-04-05T00:00:00.000Z": {
                createdAt: "2020-04-05T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 3 },
              },
              "2020-04-09T00:00:00.000Z": {
                createdAt: "2020-04-09T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 9 },
              },
            },
          },
        })
      ).toMatchInlineSnapshot(`
        Object {
          "allIds": Array [
            "2020-04-05",
            "2020-04-06",
            "2020-04-07",
            "2020-04-08",
            "2020-04-09",
          ],
          "byId": Object {
            "2020-04-05": 3.75,
            "2020-04-06": 5.25,
            "2020-04-07": 6.75,
            "2020-04-08": 8.25,
            "2020-04-09": 9,
          },
        }
      `);
    });
  });

  describe("normalizedAveragesByMonthSelector", () => {
    it("works with 1 mood", () => {
      expect(
        normalizedAveragesByMonthSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-28T00:00:00.000Z"],
            byId: {
              "2020-07-28T00:00:00.000Z": {
                createdAt: "2020-07-28T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
            },
          },
        })
      ).toEqual({ allIds: ["2020-07-01"], byId: { "2020-07-01": 5 } });
    });

    it("works with 2 moods in the same month", () => {
      expect(
        normalizedAveragesByMonthSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-28T00:00:00.000Z", "2020-07-29T00:00:00.000Z"],
            byId: {
              "2020-07-28T00:00:00.000Z": {
                createdAt: "2020-07-28T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
              "2020-07-29T00:00:00.000Z": {
                createdAt: "2020-07-29T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 7 },
              },
            },
          },
        })
      ).toEqual({ allIds: ["2020-07-01"], byId: { "2020-07-01": 6 } });
    });

    it("works with 2 moods in adjacent months", () => {
      expect(
        normalizedAveragesByMonthSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-06-25T00:00:00.000Z", "2020-07-28T00:00:00.000Z"],
            byId: {
              "2020-06-25T00:00:00.000Z": {
                createdAt: "2020-06-25T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
              "2020-07-28T00:00:00.000Z": {
                createdAt: "2020-07-28T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
            },
          },
        })
      ).toEqual({
        allIds: ["2020-06-01", "2020-07-01"],
        byId: { "2020-06-01": 5, "2020-07-01": 5 },
      });

      expect(
        normalizedAveragesByMonthSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-06-10T00:00:00.000Z", "2020-07-10T00:00:00.000Z"],
            byId: {
              "2020-06-10T00:00:00.000Z": {
                createdAt: "2020-06-10T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 4 },
              },
              "2020-07-10T00:00:00.000Z": {
                createdAt: "2020-07-10T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 7 },
              },
            },
          },
        })
      ).toMatchInlineSnapshot(`
        Object {
          "allIds": Array [
            "2020-06-01",
            "2020-07-01",
          ],
          "byId": Object {
            "2020-06-01": 5.05,
            "2020-07-01": 6.550000000000001,
          },
        }
      `);
    });

    it("works with 2 moods in separate non-adjacent months", () => {
      expect(
        normalizedAveragesByMonthSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-04-05T00:00:00.000Z", "2020-07-31T00:00:00.000Z"],
            byId: {
              "2020-04-05T00:00:00.000Z": {
                createdAt: "2020-04-05T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
              "2020-07-31T00:00:00.000Z": {
                createdAt: "2020-07-31T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
            },
          },
        })
      ).toEqual({
        allIds: ["2020-04-01", "2020-05-01", "2020-06-01", "2020-07-01"],
        byId: {
          "2020-04-01": 5,
          "2020-05-01": 5,
          "2020-06-01": 5,
          "2020-07-01": 5,
        },
      });

      expect(
        normalizedAveragesByMonthSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-04-05T00:00:00.000Z", "2020-07-05T00:00:00.000Z"],
            byId: {
              "2020-04-05T00:00:00.000Z": {
                createdAt: "2020-04-05T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 3 },
              },
              "2020-07-05T00:00:00.000Z": {
                createdAt: "2020-07-05T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 9 },
              },
            },
          },
        })
      ).toMatchInlineSnapshot(`
        Object {
          "allIds": Array [
            "2020-04-01",
            "2020-05-01",
            "2020-06-01",
            "2020-07-01",
          ],
          "byId": Object {
            "2020-04-01": 3.857142857142857,
            "2020-05-01": 5.736263736263737,
            "2020-06-01": 7.747252747252748,
            "2020-07-01": 8.868131868131869,
          },
        }
      `);
    });
  });

  describe("normalizedAveragesByWeekSelector", () => {
    it("works with 1 mood", () => {
      expect(
        normalizedAveragesByWeekSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-28T00:00:00.000Z"],
            byId: {
              "2020-07-28T00:00:00.000Z": {
                createdAt: "2020-07-28T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
            },
          },
        })
      ).toEqual({ allIds: ["2020-07-27"], byId: { "2020-07-27": 5 } });
    });

    it("gets date correct", () => {
      expect(
        normalizedAveragesByWeekSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-08-16T22:00:00.000Z"],
            byId: {
              "2020-08-16T22:00:00.000Z": {
                createdAt: "2020-08-16T22:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
            },
          },
        })
      ).toEqual({ allIds: ["2020-08-10"], byId: { "2020-08-10": 5 } });
    });

    it("works with 2 moods in the same week", () => {
      expect(
        normalizedAveragesByWeekSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-28T00:00:00.000Z", "2020-07-29T00:00:00.000Z"],
            byId: {
              "2020-07-28T00:00:00.000Z": {
                createdAt: "2020-07-28T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
              "2020-07-29T00:00:00.000Z": {
                createdAt: "2020-07-29T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 7 },
              },
            },
          },
        })
      ).toEqual({ allIds: ["2020-07-27"], byId: { "2020-07-27": 6 } });
    });

    it("works with 2 moods in adjacent weeks", () => {
      expect(
        normalizedAveragesByWeekSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-25T00:00:00.000Z", "2020-07-28T00:00:00.000Z"],
            byId: {
              "2020-07-25T00:00:00.000Z": {
                createdAt: "2020-07-25T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
              "2020-07-28T00:00:00.000Z": {
                createdAt: "2020-07-28T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
            },
          },
        })
      ).toEqual({
        allIds: ["2020-07-20", "2020-07-27"],
        byId: { "2020-07-20": 5, "2020-07-27": 5 },
      });

      expect(
        normalizedAveragesByWeekSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-25T00:00:00.000Z", "2020-07-28T00:00:00.000Z"],
            byId: {
              "2020-07-25T00:00:00.000Z": {
                createdAt: "2020-07-25T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 3 },
              },
              "2020-07-28T00:00:00.000Z": {
                createdAt: "2020-07-28T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 6 },
              },
            },
          },
        })
      ).toMatchInlineSnapshot(`
        Object {
          "allIds": Array [
            "2020-07-20",
            "2020-07-27",
          ],
          "byId": Object {
            "2020-07-20": 4,
            "2020-07-27": 5.5,
          },
        }
      `);
    });

    it("works with 2 moods in separate non-adjacent weeks", () => {
      expect(
        normalizedAveragesByWeekSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-05T00:00:00.000Z", "2020-07-31T00:00:00.000Z"],
            byId: {
              "2020-07-05T00:00:00.000Z": {
                createdAt: "2020-07-05T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
              "2020-07-31T00:00:00.000Z": {
                createdAt: "2020-07-31T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
            },
          },
        })
      ).toEqual({
        allIds: [
          "2020-06-29",
          "2020-07-06",
          "2020-07-13",
          "2020-07-20",
          "2020-07-27",
        ],
        byId: {
          "2020-06-29": 5,
          "2020-07-06": 5,
          "2020-07-13": 5,
          "2020-07-20": 5,
          "2020-07-27": 5,
        },
      });

      expect(
        normalizedAveragesByWeekSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-05T00:00:00.000Z", "2020-07-25T00:00:00.000Z"],
            byId: {
              "2020-07-05T00:00:00.000Z": {
                createdAt: "2020-07-05T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 4 },
              },
              "2020-07-25T00:00:00.000Z": {
                createdAt: "2020-07-25T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 6 },
              },
            },
          },
        })
      ).toMatchInlineSnapshot(`
        Object {
          "allIds": Array [
            "2020-06-29",
            "2020-07-06",
            "2020-07-13",
            "2020-07-20",
          ],
          "byId": Object {
            "2020-06-29": 4.050000000000001,
            "2020-07-06": 4.449999999999999,
            "2020-07-13": 5.15,
            "2020-07-20": 5.75,
          },
        }
      `);
    });
  });

  describe("normalizedAveragesByYearSelector", () => {
    it("works with 1 mood", () => {
      expect(
        normalizedAveragesByYearSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-28T00:00:00.000Z"],
            byId: {
              "2020-07-28T00:00:00.000Z": {
                createdAt: "2020-07-28T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
            },
          },
        })
      ).toEqual({ allIds: ["2020-01-01"], byId: { "2020-01-01": 5 } });
      expect(
        normalizedAveragesByYearSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2021-07-28T00:00:00.000Z"],
            byId: {
              "2021-07-28T00:00:00.000Z": {
                createdAt: "2021-07-28T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
            },
          },
        })
      ).toEqual({ allIds: ["2021-01-01"], byId: { "2021-01-01": 5 } });
    });

    it("works with 2 moods in the same year", () => {
      expect(
        normalizedAveragesByYearSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-28T00:00:00.000Z", "2020-07-29T00:00:00.000Z"],
            byId: {
              "2020-07-28T00:00:00.000Z": {
                createdAt: "2020-07-28T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
              "2020-07-29T00:00:00.000Z": {
                createdAt: "2020-07-29T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 7 },
              },
            },
          },
        })
      ).toEqual({ allIds: ["2020-01-01"], byId: { "2020-01-01": 6 } });
    });

    it("works with 2 moods in adjacent years", () => {
      expect(
        normalizedAveragesByYearSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-25T00:00:00.000Z", "2021-07-28T00:00:00.000Z"],
            byId: {
              "2020-07-25T00:00:00.000Z": {
                createdAt: "2020-07-25T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
              "2021-07-28T00:00:00.000Z": {
                createdAt: "2021-07-28T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
            },
          },
        })
      ).toEqual({
        allIds: ["2020-01-01", "2021-01-01"],
        byId: { "2020-01-01": 5, "2021-01-01": 5 },
      });

      expect(
        normalizedAveragesByYearSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-25T00:00:00.000Z", "2021-07-28T00:00:00.000Z"],
            byId: {
              "2020-07-25T00:00:00.000Z": {
                createdAt: "2020-07-25T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 3 },
              },
              "2021-07-28T00:00:00.000Z": {
                createdAt: "2020-07-28T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 6 },
              },
            },
          },
        })
      ).toMatchInlineSnapshot(`
        Object {
          "allIds": Array [
            "2020-01-01",
          ],
          "byId": Object {
            "2020-01-01": 4.5,
          },
        }
      `);
    });

    it("works with 2 moods in separate non-adjacent years", () => {
      expect(
        normalizedAveragesByYearSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-05T00:00:00.000Z", "2022-07-31T00:00:00.000Z"],
            byId: {
              "2020-07-05T00:00:00.000Z": {
                createdAt: "2020-07-05T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
              "2022-07-31T00:00:00.000Z": {
                createdAt: "2022-07-31T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 5 },
              },
            },
          },
        })
      ).toEqual({
        allIds: ["2020-01-01", "2021-01-01", "2022-01-01"],
        byId: { "2020-01-01": 5, "2021-01-01": 5, "2022-01-01": 5 },
      });

      expect(
        normalizedAveragesByYearSelector({
          ...initialState,
          events: {
            ...initialState.events,
            allIds: ["2020-07-05T00:00:00.000Z", "2022-07-25T00:00:00.000Z"],
            byId: {
              "2020-07-05T00:00:00.000Z": {
                createdAt: "2020-07-05T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 4 },
              },
              "2022-07-25T00:00:00.000Z": {
                createdAt: "2022-07-25T00:00:00.000Z",
                type: "v1/moods/create",
                payload: { mood: 6 },
              },
            },
          },
        })
      ).toMatchInlineSnapshot(`
        Object {
          "allIds": Array [
            "2020-01-01",
            "2021-01-01",
            "2022-01-01",
          ],
          "byId": Object {
            "2020-01-01": 4.24,
            "2021-01-01": 4.966666666666667,
            "2022-01-01": 5.726666666666667,
          },
        }
      `);
    });
  });
});