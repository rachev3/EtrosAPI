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
    const { id } = req.params;

    let query = Match.findById(id);

    if (req.query.populate) {
      const populateFields = (req.query.populate as string).split(",");

      const populateOptions: Record<string, any> = {};

      populateFields.forEach((field) => {
        if (field.includes(":")) {
          const [fieldName, selection] = field.split(":");
          const select = selection.replace(/;/g, " ");
          query = query.populate({
            path: fieldName,
            select,
          });
        } else if (field.includes(".")) {
          const parts = field.split(".");
          let currentPath = parts[0];

          if (!populateOptions[currentPath]) {
            populateOptions[currentPath] = {
              path: currentPath,
              populate: {},
            };
          }

          if (parts.length === 2) {
            populateOptions[currentPath].populate = { path: parts[1] };
          } else if (parts.length > 2) {
            query = query.populate({
              path: parts[0],
              populate: {
                path: parts[1],
              },
            });
          }
        } else {
          query = query.populate(field);
        }
      });

      Object.values(populateOptions).forEach((option) => {
        query = query.populate(option);
      });
    }

    const match = await query;

    if (!match) {
      throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
    }

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

    const {
      opponent,
      date,
      location,
      ourScore,
      opponentScore,
      teamStats,
      playerStats,
    } = req.body;

    let result: MatchResult = "Pending";
    if (
      ourScore !== null &&
      opponentScore !== null &&
      ourScore !== undefined &&
      opponentScore !== undefined
    ) {
      result =
        ourScore > opponentScore
          ? "Win"
          : ourScore < opponentScore
          ? "Loss"
          : "Pending";
    }

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
      ...(teamStats || {}),
    };

    const matchData: IMatch = {
      opponent,
      date: new Date(date),
      location,
      status: "upcoming",
      result,
      ourScore: ourScore !== undefined ? ourScore : null,
      opponentScore: opponentScore !== undefined ? opponentScore : null,
      teamStats: finalTeamStats,
      playerStats: playerStats || [],
    };

    const newMatch = await Match.create(matchData);

    res.status(201).json({
      success: true,
      data: newMatch,
    });
  }
);

export const updateMatch = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.result && updateData.result !== "Pending") {
      if (
        updateData.ourScore === undefined ||
        updateData.opponentScore === undefined
      ) {
        throw new AppError(
          "Score values are required when setting a match result",
          400,
          "MISSING_SCORES"
        );
      }
    }

    const updatedMatch = await Match.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedMatch) {
      throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
    }

    res.status(200).json({
      success: true,
      data: updatedMatch,
    });
  }
);

const updateStatsAfterMatch = async (
  match: MatchDocument
): Promise<boolean> => {
  try {
    const populatedMatch = await Match.findById(match._id).populate(
      "playerStats"
    );

    if (
      !populatedMatch ||
      !populatedMatch.playerStats ||
      populatedMatch.playerStats.length === 0
    ) {
      console.log("No player stats found for this match");
      return false;
    }

    const teamStats: TeamStats = {
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

    populatedMatch.playerStats.forEach((playerStat: any) => {
      teamStats.fieldGoalsMade += playerStat.fieldGoalsMade || 0;
      teamStats.fieldGoalsAttempted += playerStat.fieldGoalsAttempted || 0;
      teamStats.twoPointsMade += playerStat.twoPointsMade || 0;
      teamStats.twoPointsAttempted += playerStat.twoPointsAttempted || 0;
      teamStats.threePointsMade += playerStat.threePointsMade || 0;
      teamStats.threePointsAttempted += playerStat.threePointsAttempted || 0;
      teamStats.freeThrowsMade += playerStat.freeThrowsMade || 0;
      teamStats.freeThrowsAttempted += playerStat.freeThrowsAttempted || 0;
      teamStats.offensiveRebounds += playerStat.offensiveRebounds || 0;
      teamStats.defensiveRebounds += playerStat.defensiveRebounds || 0;
      teamStats.totalRebounds += playerStat.totalRebounds || 0;
      teamStats.assists += playerStat.assists || 0;
      teamStats.steals += playerStat.steals || 0;
      teamStats.blocks += playerStat.blocks || 0;
      teamStats.turnovers += playerStat.turnovers || 0;
      teamStats.fouls += playerStat.fouls || 0;
      teamStats.points += playerStat.points || 0;
    });

    await Match.findByIdAndUpdate(match._id, { teamStats });

    console.log("Match stats updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating stats after match:", error);
    return false;
  }
};

export const deleteMatch = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const match = await Match.findByIdAndDelete(id);

    if (!match) {
      throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
    }

    res.status(200).json({
      success: true,
      data: {
        message: "Match deleted successfully",
      },
    });
  }
);
