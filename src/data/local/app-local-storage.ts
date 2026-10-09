import {Injectable} from '@angular/core';
import {filter, fromEvent, map, merge, Observable, Subject} from 'rxjs';
import {AppSettings, DEFAULT_APP_SETTINGS, isAppSettings} from '../model/settings/app-settings';

const APP_SETTINGS_STORAGE_KEY = 'darts-matcher:app-settings';

export interface LocalStorageEntry<T> {
  readonly key: string;
  readonly valueTypeGuard: (value: unknown) => value is T;
  readonly createDefault: () => T;
}

interface LocalStorageEntries {
  readonly appSettings: LocalStorageEntry<AppSettings>;
}

/**
 * Stores application values using registered keys, type guards and defaults.
 * Replaces invalid stored values with defaults when the service is created.
 */
@Injectable({providedIn: 'root'})
export class AppLocalStorage {
  private readonly valueChanges$ = new Subject<string>();

  readonly entries: LocalStorageEntries = {
    appSettings: {
      key: APP_SETTINGS_STORAGE_KEY,
      valueTypeGuard: isAppSettings,
      createDefault: () => ({...DEFAULT_APP_SETTINGS})
    }
  };

  constructor() {
    this.cleanStorage();
  }

  /**
   * Reads a value, returning defaults when missing, invalid or unreadable.
   * Does not write to storage.
   *
   * @param entry - Entry to read.
   * @returns The stored value or a fresh default.
   */
  getValue<T>(entry: LocalStorageEntry<T>): T {
    const storedValue = this.readStoredValue(entry);

    if (storedValue === null) {
      return entry.createDefault();
    }

    try {
      const value: unknown = JSON.parse(storedValue);

      return entry.valueTypeGuard(value) ? value : entry.createDefault();
    } catch {
      return entry.createDefault();
    }
  }

  /**
   * Observes successful saves and deletions through this service and changes from other tabs.
   * Does not emit an initial value.
   *
   * @param entry - Entry to observe.
   * @returns Observable emitting the current value or its default after changes.
   */
  getValueChanges$<T>(entry: LocalStorageEntry<T>): Observable<T> {
    const storageChanges$ = fromEvent<StorageEvent>(window, 'storage').pipe(
      filter(event => event.storageArea === localStorage),
      map(event => event.key)
    );

    return merge(this.valueChanges$, storageChanges$).pipe(
      filter(key => key === entry.key || key === null),
      map(() => this.getValue(entry))
    );
  }

  /**
   * Saves a valid value. Serialization and storage failures propagate.
   *
   * @param entry - Entry to write.
   * @param value - Value to store.
   * @throws TypeError when the value or its JSON representation is invalid.
   * @throws When serialization or writing to storage fails.
   */
  saveValue<T>(entry: LocalStorageEntry<T>, value: T): void {
    if (!entry.valueTypeGuard(value)) {
      throw new TypeError(`Invalid value for local storage entry '${entry.key}'`);
    }

    const storedValue = JSON.stringify(value);

    if (storedValue === undefined || !this.isValidStoredValue(entry, storedValue)) {
      throw new TypeError(`Invalid serialized value for local storage entry '${entry.key}'`);
    }

    localStorage.setItem(entry.key, storedValue);
    this.valueChanges$.next(entry.key);
  }

  /**
   * Deletes a stored value. Storage failures propagate.
   *
   * @param entry - Entry to delete.
   * @throws When deleting from storage fails.
   */
  deleteValue(entry: LocalStorageEntry<unknown>): void {
    localStorage.removeItem(entry.key);
    this.valueChanges$.next(entry.key);
  }

  /**
   * Replaces invalid registered values with defaults.
   * Missing or unreadable entries are left unchanged. Failed writes propagate.
   *
   * @throws When an invalid stored value cannot be replaced with its default.
   */
  private cleanStorage(): void {
    const entries: readonly LocalStorageEntry<unknown>[] = Object.values(this.entries);

    for (const entry of entries) {
      const storedValue = this.readStoredValue(entry);

      if (storedValue === null || this.isValidStoredValue(entry, storedValue)) {
        continue;
      }

      this.saveValue(entry, entry.createDefault());
    }
  }

  /**
   * Reads the stored string, returning null when missing or unreadable.
   *
   * @param entry - Entry to read.
   * @returns The stored string, or null when missing or unreadable.
   */
  private readStoredValue(entry: LocalStorageEntry<unknown>): string | null {
    try {
      return localStorage.getItem(entry.key);
    } catch {
      return null;
    }
  }

  /**
   * Checks whether stored JSON satisfies the entry's value contract.
   *
   * @param entry - Entry used to validate the parsed value.
   * @param storedValue - Stored string to parse and validate.
   * @returns Whether the string contains valid JSON representing a valid value.
   */
  private isValidStoredValue(
    entry: LocalStorageEntry<unknown>,
    storedValue: string
  ): boolean {
    try {
      const value: unknown = JSON.parse(storedValue);

      return entry.valueTypeGuard(value);
    } catch {
      return false;
    }
  }
}
