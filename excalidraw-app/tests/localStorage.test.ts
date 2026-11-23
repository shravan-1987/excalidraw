import { STORAGE_KEYS } from "../app_constants";
import { importFromLocalStorage } from "../data/localStorage";

describe("browser box selection preferences", () => {
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
    expect(importFromLocalStorage().appState?.boxSelectionMode).toBe(expected);
  });
});
