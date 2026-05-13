export function getData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.error(`Failed to save data for key: ${key}`);
  }
}

export function removeData(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    console.error(`Failed to remove data for key: ${key}`);
  }
}
