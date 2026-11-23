import { STORAGE_KEYS } from "../app_constants";
import { importFromLocalStorage } from "../data/localStorage";

describe("browser selection preferences", () => {
  afterEach(() =>
    localStorage.removeItem(STORAGE_KEYS.LOCAL_STORAGE_APP_STATE),
  );

  it.each([
    [{}, "overlap", "contain"],
    [{ boxSelectionMode: "contain" }, "overlap", "contain"],
    [{ boxSelectionMode: "overlap" }, "overlap", "overlap"],
    [
      { boxSelectionMode: "overlap", lassoSelectionMode: "contain" },
      "overlap",
      "contain",
    ],
    [
      { boxSelectionModeVersion: 1, boxSelectionMode: "overlap" },
      "overlap",
      "contain",
    ],
    [
      { boxSelectionModeVersion: 1, boxSelectionMode: "contain" },
      "contain",
      "contain",
    ],
  ] as const)(
    "restores %j with marquee mode %s and lasso mode %s",
    (stored, boxSelectionMode, lassoSelectionMode) => {
      localStorage.setItem(
        STORAGE_KEYS.LOCAL_STORAGE_APP_STATE,
        JSON.stringify(stored),
      );
      expect(importFromLocalStorage().appState).toMatchObject({
        boxSelectionMode,
        lassoSelectionMode,
      });
    },
  );

  it.each([[null], [[]], [false], [42], ["selection"]])(
    "ignores non-object browser state %j",
    (stored) => {
      localStorage.setItem(
        STORAGE_KEYS.LOCAL_STORAGE_APP_STATE,
        JSON.stringify(stored),
      );
      expect(importFromLocalStorage().appState).toBeNull();
    },
  );

  it.each([null, "1", 0, 2])(
    "ignores selection modes with version %j",
    (version) => {
      localStorage.setItem(
        STORAGE_KEYS.LOCAL_STORAGE_APP_STATE,
        JSON.stringify({
          name: "Saved drawing",
          boxSelectionModeVersion: version,
          boxSelectionMode: "contain",
          lassoSelectionMode: "overlap",
        }),
      );
      expect(importFromLocalStorage().appState).toMatchObject({
        name: "Saved drawing",
        boxSelectionMode: "overlap",
        lassoSelectionMode: "contain",
      });
    },
  );

  it("defaults invalid modes in a supported save", () => {
    localStorage.setItem(
      STORAGE_KEYS.LOCAL_STORAGE_APP_STATE,
      JSON.stringify({
        boxSelectionModeVersion: 1,
        boxSelectionMode: ["contain"],
        lassoSelectionMode: "invalid",
      }),
    );
    expect(importFromLocalStorage().appState).toMatchObject({
      boxSelectionMode: "overlap",
      lassoSelectionMode: "contain",
    });
  });

  it("restores an explicit lasso preference independently of the marquee", () => {
    localStorage.setItem(
      STORAGE_KEYS.LOCAL_STORAGE_APP_STATE,
      JSON.stringify({
        boxSelectionModeVersion: 1,
        boxSelectionMode: "contain",
        lassoSelectionMode: "overlap",
      }),
    );
    expect(importFromLocalStorage().appState).toMatchObject({
      boxSelectionMode: "contain",
      lassoSelectionMode: "overlap",
    });
  });
});
