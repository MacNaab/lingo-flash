const DB_NAME = "LingoFlashDB";
const DB_VERSION = 2;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("Error opening database");
    request.onsuccess = () => resolve(request.result);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("folders")) {
        db.createObjectStore("folders", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("flashcards")) {
        const cardStore = db.createObjectStore("flashcards", { keyPath: "id" });
        cardStore.createIndex("folderId", "folderId", { unique: false });
        cardStore.createIndex("nextReview", "nextReview", { unique: false });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("gamification")) {
        db.createObjectStore("gamification", { keyPath: "key" });
      }
    };
  });
};

export const getAllItems = async <T>(storeName: string): Promise<T[]> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
};

export const getItem = async <T>(
  storeName: string,
  key: string,
): Promise<T | undefined> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
  });
};

export const saveItem = async <T>(
  storeName: string,
  item: T,
): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    store.put(item);
    transaction.oncomplete = () => resolve();
  });
};

export const deleteItem = async (
  storeName: string,
  id: string,
): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    store.delete(id);
    transaction.oncomplete = () => resolve();
  });
};
