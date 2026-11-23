import {
  clearAppStateForLocalStorage,
  getDefaultAppState,
  isSelectionMode,
} from "@excalidraw/excalidraw/appState";

import type { Merge } from "@excalidraw/common/utility-types";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { AppState } from "@excalidraw/excalidraw/types";

import { STORAGE_KEYS } from "../app_constants";

export const saveUsernameToLocalStorage = (username: string) => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.LOCAL_STORAGE_COLLAB,
      JSON.stringify({ username }),
    );
  } catch (error: any) {
    // Unable to access window.localStorage
    console.error(error);
  }
};

export const importUsernameFromLocalStorage = (): string | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_COLLAB);
    if (data) {
      return JSON.parse(data).username;
    }
  } catch (error: any) {
    // Unable to access localStorage
    console.error(error);
  }

  return null;
};

export const importFromLocalStorage = () => {
  let savedElements = null;
  let savedState = null;

  try {
    savedElements = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_ELEMENTS);
    savedState = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_APP_STATE);
  } catch (error: any) {
    // Unable to access localStorage
    console.error(error);
  }

  let elements: ExcalidrawElement[] = [];
  if (savedElements) {
    try {
      elements = JSON.parse(savedElements);
    } catch (error: any) {
      console.error(error);
      // Do nothing because elements array is already empty
    }
  }

  let appState = null;
  if (savedState) {
    try {
      const parsed: unknown = JSON.parse(savedState);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return { elements, appState };
      }

      const {
        boxSelectionModeVersion,
        boxSelectionMode,
        lassoSelectionMode,
        ...stored
      } = parsed as Merge<
        Partial<AppState>,
        {
          boxSelectionModeVersion?: unknown;
          boxSelectionMode?: unknown;
          lassoSelectionMode?: unknown;
        }
      >;
      const isLegacy = boxSelectionModeVersion === undefined;
      const isCurrentVersion = boxSelectionModeVersion === 1;
      appState = {
        ...getDefaultAppState(),
        ...clearAppStateForLocalStorage(stored),
      };

      if (isCurrentVersion && isSelectionMode(boxSelectionMode)) {
        appState.boxSelectionMode = boxSelectionMode;
      }
      if (
        (isCurrentVersion || isLegacy) &&
        isSelectionMode(lassoSelectionMode)
      ) {
        appState.lassoSelectionMode = lassoSelectionMode;
      } else if (
        isLegacy &&
        boxSelectionMode === "overlap" &&
        lassoSelectionMode === undefined
      ) {
        // In legacy saves, overlap was an explicit choice for both tools.
        appState.lassoSelectionMode = boxSelectionMode;
      }
    } catch (error: any) {
      console.error(error);
      // Do nothing because appState is already null
    }
  }
  return { elements, appState };
};

export const getElementsStorageSize = () => {
  try {
    const elements = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_ELEMENTS);
    const elementsSize = elements?.length || 0;
    return elementsSize;
  } catch (error: any) {
    console.error(error);
    return 0;
  }
};

export const getTotalStorageSize = () => {
  try {
    const appState = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_APP_STATE);
    const collab = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_COLLAB);

    const appStateSize = appState?.length || 0;
    const collabSize = collab?.length || 0;

    return appStateSize + collabSize + getElementsStorageSize();
  } catch (error: any) {
    console.error(error);
    return 0;
  }
};
