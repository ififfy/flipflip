import AppStorageState from "src/common/AppStorageState";
import AppStorage from "./AppStorage";

// Current storage list
const currentStorages: Map<number, AppStorage> = new Map();

export function createNewAppStorage(windowId: number) {
  const storage = new AppStorage(windowId);
  currentStorages.set(windowId, storage);
  return storage.initialState;
}

function getAppStorage(windowId: number) {
  return windowId === 1 ? currentStorages.get(windowId) : undefined;
}

export function saveAppStorage(windowId: number, state: AppStorageState) {
  const storage = getAppStorage(windowId);
  storage?.save(state);
}

export function createBackup(windowId: number, state: AppStorageState) {
  const storage = getAppStorage(windowId);
  storage?.backup(state);
}
