import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {X01MatchPlayer} from '../../../../data/model/x01/match/x01-match-player';
import {MatchHistoryCardData, MatchHistoryCardPlayerData} from '../match-history-card/match-history-card-data';
import {MatchHistoryEntry} from '../../../../data/model/match-history/match-history-entry';

/**
 * Resolves history entries into card data, preserving their supplied order.
 *
 * @param matchHistoryEntries - History entries to display.
 * @returns Card data in the supplied entry order.
 */
export function resolveMatchHistoryCards(matchHistoryEntries: MatchHistoryEntry[]): MatchHistoryCardData[] {
  return matchHistoryEntries.map(resolveMatchHistoryCard);
}

/**
 * Resolves a history entry into card display data.
 *
 * @param matchHistoryEntry - Match and its last visit timestamp.
 * @returns Display data for the match history card.
 */
function resolveMatchHistoryCard(matchHistoryEntry: MatchHistoryEntry): MatchHistoryCardData {
  const match = matchHistoryEntry.match;
  const bestOf = match.matchSettings.bestOf;

  return {
    matchId: match.id,
    x01: match.matchSettings.x01,
    bestOfSets: bestOf.sets,
    bestOfLegs: bestOf.legs,
    bestOfType: bestOf.bestOfType,
    startDate: match.startDate,
    lastVisitedAt: matchHistoryEntry.lastVisitedAt,
    matchStatus: match.matchStatus,
    players: match.players.map(player => resolvePlayer(match, player))
  };
}

/**
 * Resolves player display data using standings for scores.
 *
 * Missing standings default to zero. Checkout percentage is omitted
 * when doubles tracking is disabled.
 *
 * @param match - Match containing the standings and settings.
 * @param player - Player whose display data is resolved.
 * @returns Player display data for the match history card.
 */
function resolvePlayer(match: X01Match, player: X01MatchPlayer): MatchHistoryCardPlayerData {
  const standing = match.standings[player.playerId];

  return {
    playerId: player.playerId,
    name: player.playerName,
    setsWon: standing?.setsWon ?? 0,
    legsWon: standing?.legsWonInCurrentSet ?? 0,
    average: player.statistics.averageStats.average,
    checkoutPercentage: match.matchSettings.trackDoubles
      ? player.statistics.checkoutStats.checkoutPercentage
      : null,
    resultType: player.resultType
  };
}
