import PlayerStats from "../models/PlayerStats.js";
import Match from "../models/Match.js";
import Player from "../models/Player.js";
import APIFeatures from "../utils/apiFeatures.js";
import { Request, Response } from "express";
import { TypedRequest } from "../types/express/index.js";
import { AppError } from "../middleware/errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import { IPlayerStats } from "../types/models/PlayerStats.js";
import { ObjectId } from "../types/index.js";

interface PlayerStatsRequestBody {
  matchId: string;
  playerId: string;
  fieldGoalsMade?: number;
  fieldGoalsAttempted?: number;
  twoPointsMade?: number;
  twoPointsAttempted?: number;
  threePointsMade?: number;
  threePointsAttempted?: number;
  freeThrowsMade?: number;
  freeThrowsAttempted?: number;
  offensiveRebounds?: number;
  defensiveRebounds?: number;
  totalRebounds?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  fouls?: number;
  plusMinus?: number;
  efficiency?: number;
  points?: number;
}

export const getAllPlayerStats = asyncHandler(
  async (req: Request, res: Response) => {
    const features = new APIFeatures(PlayerStats.find(), req.query)
      .filter()
      .sort();

    await features.paginate();

    features.populate();

    const stats = await features.query;

    res.status(200).json({
      success: true,
      count: stats.length,
      pagination: features.paginationData,
      data: stats,
    });
  }
);

export const getStatsByPlayer = asyncHandler(
  async (req: Request<{ playerId: string }>, res: Response) => {
    const { playerId } = req.params;
    const stats = await PlayerStats.find({ player: playerId }).populate(
      "match"
    );

    if (!stats.length) {
      throw new AppError(
        "No stats found for this player",
        404,
        "PLAYER_STATS_NOT_FOUND"
      );
    }

    res.status(200).json({
      success: true,
      count: stats.length,
      data: stats,
    });
  }
);

export const getStatsByMatch = asyncHandler(
  async (req: Request<{ matchId: string }>, res: Response) => {
    const { matchId } = req.params;
    const stats = await PlayerStats.find({ match: matchId }).populate("player");

    if (!stats.length) {
      throw new AppError(
        "No stats found for this match",
        404,
        "PLAYER_STATS_NOT_FOUND"
      );
    }

    res.status(200).json({
      success: true,
      count: stats.length,
      data: stats,
    });
  }
);

export const addPlayerStats = asyncHandler(
  async (req: TypedRequest<PlayerStatsRequestBody>, res: Response) => {
    const {
      matchId,
      playerId,
      fieldGoalsMade,
      fieldGoalsAttempted,
      twoPointsMade,
      twoPointsAttempted,
      threePointsMade,
      threePointsAttempted,
      freeThrowsMade,
      freeThrowsAttempted,
      offensiveRebounds,
      defensiveRebounds,
      totalRebounds,
      assists,
      steals,
      blocks,
      turnovers,
      fouls,
      plusMinus,
      efficiency,
      points,
    } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
    }

    const player = await Player.findById(playerId);
    if (!player) {
      throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");
    }

    const newStatsData: IPlayerStats = {
      match: matchId,
      player: playerId,
      fieldGoalsMade: fieldGoalsMade || 0,
      fieldGoalsAttempted: fieldGoalsAttempted || 0,
      twoPointsMade: twoPointsMade || 0,
      twoPointsAttempted: twoPointsAttempted || 0,
      threePointsMade: threePointsMade || 0,
      threePointsAttempted: threePointsAttempted || 0,
      freeThrowsMade: freeThrowsMade || 0,
      freeThrowsAttempted: freeThrowsAttempted || 0,
      offensiveRebounds: offensiveRebounds || 0,
      defensiveRebounds: defensiveRebounds || 0,
      totalRebounds: totalRebounds || 0,
      assists: assists || 0,
      steals: steals || 0,
      blocks: blocks || 0,
      turnovers: turnovers || 0,
      fouls: fouls || 0,
      plusMinus: plusMinus || 0,
      efficiency: efficiency || 0,
      points: points || 0,
    };

    const newStats = await PlayerStats.create(newStatsData);

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

    res.status(201).json({
      success: true,
      data: newStats,
    });
  }
);

export const updatePlayerStats = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const updatedStats = await PlayerStats.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedStats) {
      throw new AppError(
        "Player stats not found",
        404,
        "PLAYER_STATS_NOT_FOUND"
      );
    }

    res.status(200).json({
      success: true,
      data: updatedStats,
    });
  }
);

export const deletePlayerStats = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const deletedStats = await PlayerStats.findByIdAndDelete(id);

    if (!deletedStats) {
      throw new AppError(
        "Player stats not found",
        404,
        "PLAYER_STATS_NOT_FOUND"
      );
    }

    res.status(200).json({
      success: true,
      data: {
        message: "Player stats deleted successfully",
      },
    });
  }
);
