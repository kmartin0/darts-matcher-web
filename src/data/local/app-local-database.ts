import {Injectable} from '@angular/core';
import {Dexie, Table, TransactionMode} from 'dexie';
import {isStoredMatchHistoryItem, StoredMatchHistoryItem} from '../model/match-history/stored-match-history-item';
import {isLocalMatchSettings, LocalMatchSettings} from '../model/settings/local-match-settings';

const DATABASE_NAME = 'darts-matcher';
const MATCH_HISTORY_TABLE_NAME = 'matchHistory';
const LOCAL_MATCH_SETTINGS_TABLE_NAME = 'localMatchSettings';

interface LocalDatabaseTables {
  readonly matchHistory: Table<StoredMatchHistoryItem, string>;
  readonly localMatchSettings: Table<LocalMatchSettings, string>;
}

type LocalDatabaseTable = LocalDatabaseTables[keyof LocalDatabaseTables];

/**
 * Provides the application's shared local database and typed tables.
 *
 * Removes malformed stored items during initialization and validates writes
 * made through these tables. Match-specific rules remain in the repositories.
 */
@Injectable({providedIn: 'root'})
export class AppLocalDatabase {
  private readonly database = this.createDatabase();

  readonly tables: LocalDatabaseTables = {
    matchHistory: this.database.table<StoredMatchHistoryItem, string>(
      MATCH_HISTORY_TABLE_NAME
    ),
    localMatchSettings: this.database.table<LocalMatchSettings, string>(
      LOCAL_MATCH_SETTINGS_TABLE_NAME
    )
  };

  constructor() {
    this.registerMatchHistoryValidation();
    this.registerLocalMatchSettingsValidation();
  }

  /**
   * Executes database operations within a transaction.
   *
   * @param mode - Transaction access mode.
   * @param tables - Table or tables accessed by the operation.
   * @param operation - Database operations to execute within the transaction.
   * @returns Promise resolving to the operation's result after the transaction commits.
   * Rejects if the operation or transaction fails.
   */
  transaction<T>(
    mode: TransactionMode,
    tables: LocalDatabaseTable | LocalDatabaseTable[],
    operation: () => T | PromiseLike<T>
  ): Promise<T> {
    const transactionTables = Array.isArray(tables) ? tables : [tables];

    return this.database.transaction(mode, transactionTables, operation);
  }

  /**
   * Configures the database schema and registers initialization cleanup.
   *
   * The database opens automatically on the first database operation.
   * Operations wait for the registered cleanup to finish.
   *
   * @returns The configured database.
   */
  private createDatabase(): Dexie {
    const database = new Dexie(DATABASE_NAME);

    database.version(1).stores({
      [MATCH_HISTORY_TABLE_NAME]: 'matchId, lastVisitedAt',
      [LOCAL_MATCH_SETTINGS_TABLE_NAME]: 'matchId'
    });

    database.on('ready', () => this.cleanDatabase());

    return database;
  }

  /**
   * Rejects malformed history items when creating or updating stored records.
   */
  private registerMatchHistoryValidation(): void {
    this.tables.matchHistory.hook('creating', (_primaryKey, item) => {
      if (!isStoredMatchHistoryItem(item)) {
        throw new TypeError('Invalid stored match history item');
      }
    });

    this.tables.matchHistory.hook('updating', (modifications, _primaryKey, item) => {
      const updatedItem = this.applyModifications(item, modifications);

      if (!isStoredMatchHistoryItem(updatedItem)) {
        throw new TypeError('Invalid stored match history item');
      }
    });
  }

  /**
   * Rejects malformed local settings when creating or updating stored records.
   *
   * Validation checks the stored structure and ID formats.
   * Player membership and selection rules are handled by the repository.
   */
  private registerLocalMatchSettingsValidation(): void {
    this.tables.localMatchSettings.hook('creating', (_primaryKey, settings) => {
      if (!isLocalMatchSettings(settings)) {
        throw new TypeError('Invalid local match settings');
      }
    });

    this.tables.localMatchSettings.hook('updating', (modifications, _primaryKey, settings) => {
      const updatedSettings = this.applyModifications(settings, modifications);

      if (!isLocalMatchSettings(updatedSettings)) {
        throw new TypeError('Invalid local match settings');
      }
    });
  }

  /**
   * Applies update-hook changes to a copy of the stored item for validation.
   *
   * Handles nested key paths and property deletions without mutating the
   * stored item or the modifications supplied by Dexie.
   *
   * @param item - Stored item before the update.
   * @param modifications - Changed key paths and their replacement values.
   * @returns The candidate item after applying the changes.
   */
  private applyModifications(
    item: object,
    modifications: object
  ): unknown {
    const updatedItem = Dexie.deepClone(item);

    for (const [keyPath, value] of Object.entries(modifications)) {
      Dexie.setByKeyPath(updatedItem, keyPath, value);
    }

    return updatedItem;
  }

  /**
   * Removes malformed items from both tables.
   *
   * Calls made before the database and tables properties are initialized are ignored.
   *
   * @returns Promise resolving when cleanup completes or is skipped.
   */
  private async cleanDatabase(): Promise<void> {
    if (this.database === undefined || this.tables === undefined) {
      return;
    }

    await this.transaction('rw', Object.values(this.tables), async () => {
      await this.tables.matchHistory
        .filter(item => !isStoredMatchHistoryItem(item))
        .delete();

      await this.tables.localMatchSettings
        .filter(settings => !isLocalMatchSettings(settings))
        .delete();
    });
  }
}
