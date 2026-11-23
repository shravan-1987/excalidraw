import { STORAGE_KEYS } from "../app_constants";
import { importFromLocalStorage } from "../data/localStorage";

describe("browser selection preferences", () => {
  afterEach(() =>
    localStorage.removeItem(STORAGE_KEYS.LOCAL_STORAGE_APP_STATE),
  );

  it.each([
    [{}, "overlap"],
    [{ boxSelectionMode: "contain" }, "overlap"],
    [{ boxSelectionMode: "overlap" }, "overlap"],
    [{ boxSelectionModeVersion: 1, boxSelectionMode: "contain" }, "contain"],
  ] as const)("restores %j as %s", (stored, expected) => {
    localStorage.setItem(
      STORAGE_KEYS.LOCAL_STORAGE_APP_STATE,
      JSON.stringify(stored),
    );
    expect(importFromLocalStorage().appState).toMatchObject({
      boxSelectionMode: expected,
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
