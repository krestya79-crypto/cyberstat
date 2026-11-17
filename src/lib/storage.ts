import { useState } from 'react';
export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`cyberstat:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function writeStored(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(`cyberstat:${key}`, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readStored(key, initial));
  const [failed, setFailed] = useState(false);
  function update(next: T) {
    setValue(next);
    setFailed(!writeStored(key, next));
  }
  return [value, update, failed] as const;
}
