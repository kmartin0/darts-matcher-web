import {inject, Injectable} from '@angular/core';
import {liveQuery} from 'dexie';
import {defer, from, Observable, switchMap} from 'rxjs';
import {AppLocalDatabase} from '../local/app-local-database';
import {MatchPlayer} from '../model/base-match/match-player';
import {
  createDefaultLocalMatchSettings,
  isSameLocalSettings,
  LocalMatchSettings
} from '../model/settings/local-match-settings';

/**
 * Repository responsible for local match settings.
 *
 * Validates player selections, supplies defaults, and observes settings
 * stored in the shared local database.
 */
@Injectable({providedIn: 'root'})
export class LocalMatchSettingsRepository {
  private readonly localDatabase = inject(AppLocalDatabase);

  private readonly matchSettingsTable = this.localDatabase.tables.localMatchSettings;

  /**
   * Observes settings, initializing missing or invalid settings with defaults on subscription.
   * Later deletions emit defaults without persisting them.
   *
   * @param matchId - Match ID whose settings should be observed.
   * @param players - Match players used for validation and defaults.
   * @returns Observable emitting initial settings and subsequent changes.
   */
  getLocalMatchSettings$(matchId: string, players: readonly MatchPlayer[]): Observable<LocalMatchSettings> {
    // Validate and initialize persisted settings before starting the read-only live query.
    return defer(() => this.getOrCreateMatchSettings(matchId, players)).pipe(
      switchMap(() => from(liveQuery(async () => {
        const settings = await this.matchSettingsTable.get(matchId);

        return settings ?? createDefaultLocalMatchSettings(matchId, players);
      })))
    );
  }

  /**
   * Saves settings only when they differ from the stored values.
   *
   * @param settings - Settings to save.
   * @returns Promise resolving to the match ID, whether saved or unchanged.
   */
  saveMatchSettings(settings: LocalMatchSettings): Promise<string> {
    return this.localDatabase.transaction('rw', this.matchSettingsTable, async () => {
      const storedSettings = await this.matchSettingsTable.get(settings.matchId);

      // Skip writing when the persisted settings already match.
      if (storedSettings !== undefined && isSameLocalSettings(storedSettings, settings)) {
        return settings.matchId;
      }

      // Create missing settings or replace different settings.
      return this.matchSettingsTable.put(settings);
    });
  }

  /**
   * Restores and persists the defaults for a match.
   *
   * @param matchId - Match ID whose settings should be reset.
   * @param players - Match players to select in the defaults.
   * @returns Promise resolving to the saved match ID.
   */
  resetMatchSettings(matchId: string, players: readonly MatchPlayer[]): Promise<string> {
    const defaultSettings = createDefaultLocalMatchSettings(matchId, players);

    return this.saveMatchSettings(defaultSettings);
  }

  /**
   * Deletes a match's persisted local settings.
   *
   * @param matchId - Match ID whose settings should be deleted.
   * @returns Promise resolving when deletion completes.
   */
  deleteMatchSettings(matchId: string): Promise<void> {
    return this.matchSettingsTable.delete(matchId);
  }

  /**
   * Gets stored settings, creating defaults when missing or invalid for the match.
   *
   * @param matchId - Match ID whose settings should be resolved.
   * @param players - Match players used for validation and defaults.
   * @returns Promise resolving to the existing or newly persisted settings.
   */
  private getOrCreateMatchSettings(matchId: string, players: readonly MatchPlayer[]): Promise<LocalMatchSettings> {
    return this.localDatabase.transaction('rw', this.matchSettingsTable, async () => {
      const storedSettings = await this.matchSettingsTable.get(matchId);

      if (storedSettings !== undefined && this.hasValidPlayerSelections(storedSettings, players)) {
        return storedSettings;
      }

      const defaultSettings = createDefaultLocalMatchSettings(matchId, players);

      // Create missing settings or replace settings with invalid player selections.
      await this.matchSettingsTable.put(defaultSettings);

      return defaultSettings;
    });
  }

  /**
   * Checks whether selected player IDs are unique and belong to the match.
   *
   * @param settings - Settings whose player selections should be checked.
   * @param players - Players belonging to the match.
   * @returns Whether every selected ID is unique and belongs to a match player.
   */
  private hasValidPlayerSelections(settings: LocalMatchSettings, players: readonly MatchPlayer[]): boolean {
    const matchPlayerIds = new Set(players.map(player => player.playerId));
    const selectedPlayerIds = settings.scoreForPlayerIds;

    // Reject duplicate selected player IDs.
    if (new Set(selectedPlayerIds).size !== selectedPlayerIds.length) {
      return false;
    }

    // Every selected player must belong to the match.
    return selectedPlayerIds.every(playerId => matchPlayerIds.has(playerId));
  }
}
