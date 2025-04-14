import PlayerStats from "../models/PlayerStats";
import Match from "../models/Match";
import Player from "../models/Player";
import { IPlayerStats, PlayerStatsDocument } from "../types/models/PlayerStats";
import { AppError } from "../middleware/errorHandler";
import { ObjectId } from "../types/index";

export async function addPlayerStats(
  data: IPlayerStats
): Promise<PlayerStatsDocument> {
  const match = await Match.findById(data.match);
  if (!match) {
    throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
  }
  const player = await Player.findById(data.player);
  if (!player) {
    throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");
  }
  const newStats = await PlayerStats.create(data);
  player.statsHistory = [
    ...(player.statsHistory || []),
    newStats._id,
  ] as ObjectId[];
  await player.save();
  if (match.playerStats) {
    match.playerStats = [...match.playerStats, newStats._id] as ObjectId[];
  } else {
    match.playerStats = [newStats._id] as ObjectId[];
  }
  await match.save();
  return newStats;
}

export async function updatePlayerStats(
  id: string,
  data: Partial<IPlayerStats>
): Promise<PlayerStatsDocument> {
  const updatedStats = await PlayerStats.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!updatedStats) {
    throw new AppError("Player stats not found", 404, "PLAYER_STATS_NOT_FOUND");
  }
  return updatedStats;
}

export async function deletePlayerStats(id: string): Promise<void> {
  const deletedStats = await PlayerStats.findByIdAndDelete(id);
  if (!deletedStats) {
    throw new AppError("Player stats not found", 404, "PLAYER_STATS_NOT_FOUND");
  }
}

export async function getStatsByPlayer(
  playerId: string
): Promise<PlayerStatsDocument[]> {
  const stats = await PlayerStats.find({ player: playerId }).populate("match");
  if (!stats.length) {
    throw new AppError(
      "No stats found for this player",
      404,
      "PLAYER_STATS_NOT_FOUND"
    );
  }
  return stats;
}

export async function getStatsByMatch(
  matchId: string
): Promise<PlayerStatsDocument[]> {
  const stats = await PlayerStats.find({ match: matchId }).populate("player");
  if (!stats.length) {
    throw new AppError(
      "No stats found for this match",
      404,
      "PLAYER_STATS_NOT_FOUND"
    );
  }
  return stats;
}
