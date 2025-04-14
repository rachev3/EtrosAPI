import PlayerStats from "../models/PlayerStats";
import Match from "../models/Match";
import Player from "../models/Player";
import APIFeatures from "../utils/apiFeatures";
import { Request, Response } from "express";
import { TypedRequest } from "../types/express/index";
import { AppError } from "../middleware/errorHandler";
import asyncHandler from "../utils/asyncHandler";
import { IPlayerStats } from "../types/models/PlayerStats";
import { ObjectId } from "../types/index";
import {
  validateRequiredFields,
  validateObjectId,
  validateNumberRange,
} from "../utils/validator";
import {
  addPlayerStats as playerStatsServiceAdd,
  updatePlayerStats as playerStatsServiceUpdate,
  deletePlayerStats as playerStatsServiceDelete,
  getStatsByPlayer as playerStatsServiceGetByPlayer,
  getStatsByMatch as playerStatsServiceGetByMatch,
} from "../services/playerStatsService";

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
    const stats = await playerStatsServiceGetByPlayer(req.params.playerId);
    res.status(200).json({
      success: true,
      count: stats.length,
      data: stats,
    });
  }
);

export const getStatsByMatch = asyncHandler(
  async (req: Request<{ matchId: string }>, res: Response) => {
    const stats = await playerStatsServiceGetByMatch(req.params.matchId);
    res.status(200).json({
      success: true,
      count: stats.length,
      data: stats,
    });
  }
);

export const addPlayerStats = asyncHandler(
  async (req: TypedRequest<PlayerStatsRequestBody>, res: Response) => {
    validateRequiredFields(req.body, ["matchId", "playerId"]);
    validateObjectId(req.body.matchId, "matchId");
    validateObjectId(req.body.playerId, "playerId");
    const statFields = [
      "fieldGoalsMade",
      "fieldGoalsAttempted",
      "twoPointsMade",
      "twoPointsAttempted",
      "threePointsMade",
      "threePointsAttempted",
      "freeThrowsMade",
      "freeThrowsAttempted",
      "offensiveRebounds",
      "defensiveRebounds",
      "totalRebounds",
      "assists",
      "steals",
      "blocks",
      "turnovers",
      "fouls",
      "plusMinus",
      "efficiency",
      "points",
    ];
    const bodyAny = req.body as Record<string, any>;
    statFields.forEach((field) => {
      if (bodyAny[field] !== undefined && bodyAny[field] !== null) {
        validateNumberRange(bodyAny[field], 0, 1000, field);
      }
    });
    const newStatsData: IPlayerStats = {
      match: req.body.matchId,
      player: req.body.playerId,
      fieldGoalsMade: req.body.fieldGoalsMade || 0,
      fieldGoalsAttempted: req.body.fieldGoalsAttempted || 0,
      twoPointsMade: req.body.twoPointsMade || 0,
      twoPointsAttempted: req.body.twoPointsAttempted || 0,
      threePointsMade: req.body.threePointsMade || 0,
      threePointsAttempted: req.body.threePointsAttempted || 0,
      freeThrowsMade: req.body.freeThrowsMade || 0,
      freeThrowsAttempted: req.body.freeThrowsAttempted || 0,
      offensiveRebounds: req.body.offensiveRebounds || 0,
      defensiveRebounds: req.body.defensiveRebounds || 0,
      totalRebounds: req.body.totalRebounds || 0,
      assists: req.body.assists || 0,
      steals: req.body.steals || 0,
      blocks: req.body.blocks || 0,
      turnovers: req.body.turnovers || 0,
      fouls: req.body.fouls || 0,
      plusMinus: req.body.plusMinus || 0,
      efficiency: req.body.efficiency || 0,
      points: req.body.points || 0,
    };
    const newStats = await playerStatsServiceAdd(newStatsData);
    res.status(201).json({
      success: true,
      data: newStats,
    });
  }
);

export const updatePlayerStats = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const updatedStats = await playerStatsServiceUpdate(
      req.params.id,
      req.body
    );
    res.status(200).json({
      success: true,
      data: updatedStats,
    });
  }
);

export const deletePlayerStats = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    await playerStatsServiceDelete(req.params.id);
    res.status(200).json({
      success: true,
      data: {
        message: "Player stats deleted successfully",
      },
    });
  }
);
