export class StorageAdapter {
  static getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = window.localStorage.getItem(`vibeaudio_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`vibeaudio_${key}`, JSON.stringify(value));
    } catch (err) {
      console.warn('Storage setItem failed:', err);
    }
  }

  static removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(`vibeaudio_${key}`);
    } catch (err) {
      console.warn('Storage removeItem failed:', err);
    }
  }

  static clear(): void {
    if (typeof window === 'undefined') return;
    try {
      Object.keys(window.localStorage).forEach((k) => {
        if (k.startsWith('vibeaudio_')) {
          window.localStorage.removeItem(k);
        }
      });
    } catch (err) {
      console.warn('Storage clear failed:', err);
    }
  }
}
