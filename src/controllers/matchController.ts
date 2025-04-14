import Match from "../models/Match";
import APIFeatures from "../utils/apiFeatures";
import { Request, Response } from "express";
import { TypedRequest } from "../types/express/index";
import { AppError } from "../middleware/errorHandler";
import asyncHandler from "../utils/asyncHandler";
import {
  IMatch,
  MatchDocument,
  MatchResult,
  TeamStats,
} from "../types/models/Match";
import { ObjectId } from "../types/index";
import {
  validateRequiredFields,
  validateEnum,
  validateDate,
  validateNumberRange,
} from "../utils/validator";
import {
  createMatch as matchServiceCreate,
  updateMatch as matchServiceUpdate,
  deleteMatch as matchServiceDelete,
  getMatch as matchServiceGet,
} from "../services/matchService";

interface MatchRequestBody {
  opponent: string;
  date: string | Date;
  location: string;
  status?: "upcoming" | "finished";
  result?: MatchResult;
  ourScore?: number | null;
  opponentScore?: number | null;
  teamStats?: Partial<TeamStats>;
  playerStats?: string[] | ObjectId[];
}

export const getMatches = asyncHandler(async (req: Request, res: Response) => {
  const features = new APIFeatures(Match.find(), req.query).filter().sort();

  await features.paginate();

  features.populate();

  const matches = await features.query;

  res.status(200).json({
    success: true,
    count: matches.length,
    pagination: features.paginationData,
    data: matches,
  });
});

export const getMatch = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const match = await matchServiceGet(req.params.id);
    res.status(200).json({
      success: true,
      data: match,
    });
  }
);

export const createMatch = asyncHandler(
  async (req: TypedRequest<MatchRequestBody>, res: Response) => {
    validateRequiredFields(req.body, ["opponent", "date", "location"]);
    if (typeof req.body.date === "string") {
      validateDate(req.body.date, "date");
    }
    if (req.body.status) {
      validateEnum(req.body.status, ["upcoming", "finished"], "status");
    }
    if (req.body.result) {
      validateEnum(req.body.result, ["Win", "Loss", "Pending"], "result");
    }
    if (req.body.ourScore !== undefined && req.body.ourScore !== null) {
      validateNumberRange(req.body.ourScore, 0, 1000, "ourScore");
    }
    if (
      req.body.opponentScore !== undefined &&
      req.body.opponentScore !== null
    ) {
      validateNumberRange(req.body.opponentScore, 0, 1000, "opponentScore");
    }
    let matchData = { ...req.body };
    let date: Date | undefined = undefined;
    if (typeof matchData.date === "string") {
      const parsedDate = new Date(matchData.date);
      if (parsedDate instanceof Date && !isNaN(parsedDate.getTime())) {
        date = parsedDate;
      }
    } else if (
      matchData.date instanceof Date &&
      !isNaN(matchData.date.getTime())
    ) {
      date = matchData.date;
    }
    let teamStats;
    if (matchData.teamStats) {
      teamStats = {
        fieldGoalsMade: matchData.teamStats.fieldGoalsMade ?? 0,
        fieldGoalsAttempted: matchData.teamStats.fieldGoalsAttempted ?? 0,
        twoPointsMade: matchData.teamStats.twoPointsMade ?? 0,
        twoPointsAttempted: matchData.teamStats.twoPointsAttempted ?? 0,
        threePointsMade: matchData.teamStats.threePointsMade ?? 0,
        threePointsAttempted: matchData.teamStats.threePointsAttempted ?? 0,
        freeThrowsMade: matchData.teamStats.freeThrowsMade ?? 0,
        freeThrowsAttempted: matchData.teamStats.freeThrowsAttempted ?? 0,
        offensiveRebounds: matchData.teamStats.offensiveRebounds ?? 0,
        defensiveRebounds: matchData.teamStats.defensiveRebounds ?? 0,
        totalRebounds: matchData.teamStats.totalRebounds ?? 0,
        assists: matchData.teamStats.assists ?? 0,
        steals: matchData.teamStats.steals ?? 0,
        blocks: matchData.teamStats.blocks ?? 0,
        turnovers: matchData.teamStats.turnovers ?? 0,
        fouls: matchData.teamStats.fouls ?? 0,
        points: matchData.teamStats.points ?? 0,
      };
    }
    const matchCreateData: Partial<IMatch> = {
      ...matchData,
      date,
      teamStats,
    };
    const createdMatch = await matchServiceCreate(matchCreateData);
    res.status(201).json({
      success: true,
      data: createdMatch,
    });
  }
);

export const updateMatch = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const updatedMatch = await matchServiceUpdate(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: updatedMatch,
    });
  }
);

export const deleteMatch = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    await matchServiceDelete(req.params.id);
    res.status(200).json({
      success: true,
      data: {
        message: "Match deleted successfully",
      },
    });
  }
);
