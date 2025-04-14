import Match from "../models/Match";
import {
  IMatch,
  MatchDocument,
  MatchResult,
  TeamStats,
} from "../types/models/Match";
import { AppError } from "../middleware/errorHandler";

export async function createMatch(
  data: Partial<IMatch>
): Promise<MatchDocument> {
  // Calculate result if scores are provided
  let result: MatchResult = "Pending";
  if (
    data.ourScore !== null &&
    data.opponentScore !== null &&
    data.ourScore !== undefined &&
    data.opponentScore !== undefined
  ) {
    result =
      data.ourScore > data.opponentScore
        ? "Win"
        : data.ourScore < data.opponentScore
        ? "Loss"
        : "Pending";
  }
  // Merge team stats
  const defaultTeamStats: TeamStats = {
    fieldGoalsMade: 0,
    fieldGoalsAttempted: 0,
    twoPointsMade: 0,
    twoPointsAttempted: 0,
    threePointsMade: 0,
    threePointsAttempted: 0,
    freeThrowsMade: 0,
    freeThrowsAttempted: 0,
    offensiveRebounds: 0,
    defensiveRebounds: 0,
    totalRebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fouls: 0,
    points: 0,
  };
  const finalTeamStats: TeamStats = {
    ...defaultTeamStats,
    ...(data.teamStats || {}),
  };
  const matchData: IMatch = {
    opponent: data.opponent!,
    date: data.date!,
    location: data.location!,
    status: data.status || "upcoming",
    result,
    ourScore: data.ourScore !== undefined ? data.ourScore : null,
    opponentScore: data.opponentScore !== undefined ? data.opponentScore : null,
    teamStats: finalTeamStats,
    playerStats: data.playerStats || [],
  };
  const match = await Match.create(matchData);
  return match;
}

export async function updateMatch(
  id: string,
  data: Partial<IMatch>
): Promise<MatchDocument> {
  if (data.result && data.result !== "Pending") {
    if (data.ourScore === undefined || data.opponentScore === undefined) {
      throw new AppError(
        "Score values are required when setting a match result",
        400,
        "MISSING_SCORES"
      );
    }
  }
  const updatedMatch = await Match.findByIdAndUpdate(id, data, { new: true });
  if (!updatedMatch) {
    throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
  }
  return updatedMatch;
}

export async function deleteMatch(id: string): Promise<void> {
  const match = await Match.findByIdAndDelete(id);
  if (!match) {
    throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
  }
}

export async function getMatch(id: string): Promise<MatchDocument> {
  const match = await Match.findById(id);
  if (!match) {
    throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
  }
  return match;
}
