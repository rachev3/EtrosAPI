import Match from "../models/Match.js";
import APIFeatures from "../utils/apiFeatures.js";
import { Request, Response } from "express";
import { TypedRequest } from "../types/express/index.js";
import { AppError } from "../middleware/errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  IMatch,
  MatchDocument,
  MatchResult,
  TeamStats,
} from "../types/models/Match.js";
import { ObjectId } from "../types/index.js";
import { PopulateOptions } from "mongoose";

// Interface for match creation/update request body
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

// **1️⃣ Get All Matches**
export const getMatches = asyncHandler(async (req: Request, res: Response) => {
  // Create a new APIFeatures instance with filtering and sorting
  const features = new APIFeatures(Match.find(), req.query).filter().sort();

  // Apply pagination
  await features.paginate();

  // Apply population if requested
  features.populate();

  const matches = await features.query;

  res.status(200).json({
    success: true,
    count: matches.length,
    pagination: features.paginationData,
    data: matches,
  });
});

// **2️⃣ Get a Single Match**
export const getMatch = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    // Create a base query
    let query = Match.findById(id);

    // Apply population if requested
    if (req.query.populate) {
      const populateFields = (req.query.populate as string).split(",");

      // Create a structured object to hold nested population options
      const populateOptions: Record<string, any> = {};

      populateFields.forEach((field) => {
        // Case 1: Field with selection specified (field:selection)
        if (field.includes(":")) {
          const [fieldName, selection] = field.split(":");
          // Convert selection to space-separated string for mongoose
          const select = selection.replace(/;/g, " ");
          query = query.populate({
            path: fieldName,
            select,
          });
        }
        // Case 2: Field with dot notation for nested population (field.nestedField)
        else if (field.includes(".")) {
          const parts = field.split(".");
          let currentPath = parts[0];

          // Initialize the path in our options object if it doesn't exist
          if (!populateOptions[currentPath]) {
            populateOptions[currentPath] = {
              path: currentPath,
              populate: {},
            };
          }

          // Simple one-level nesting (e.g., field1.field2)
          if (parts.length === 2) {
            populateOptions[currentPath].populate = { path: parts[1] };
          }
          // More complex nesting - simplified approach
          else if (parts.length > 2) {
            // For simplicity, just handle direct path to avoid type issues
            query = query.populate({
              path: parts[0],
              populate: {
                path: parts[1],
              },
            });
          }
        }
        // Case 3: Simple field without nesting or selection
        else {
          query = query.populate(field);
        }
      });

      // Apply all structured nested populate options
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

// **3️⃣ Create a New Match (Admin Only)**
export const createMatch = asyncHandler(
  async (req: TypedRequest<MatchRequestBody>, res: Response) => {
    const {
      opponent,
      date,
      location,
      ourScore,
      opponentScore,
      teamStats,
      playerStats,
    } = req.body;

    // Determine result based on provided scores
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

    // Ensure `teamStats` is properly structured or use default values
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

    // Merge provided `teamStats` with defaults (if missing fields)
    const finalTeamStats: TeamStats = {
      ...defaultTeamStats,
      ...(teamStats || {}),
    };

    // Create match data
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

    // Create match
    const newMatch = await Match.create(matchData);

    res.status(201).json({
      success: true,
      data: newMatch,
    });
  }
);

// **4️⃣ Update Match Result (Admin Only)**
export const updateMatch = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    // When updating match result, ensure scores are set
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

    // Allow manual updates for all fields including team statistics
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

// Helper function to update team stats after a match
const updateStatsAfterMatch = async (
  match: MatchDocument
): Promise<boolean> => {
  try {
    // Populate playerStats to access all the individual player statistics
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

    // Initialize team stats object with zeros
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

    // Aggregate all player stats into team stats
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
      // Replace totalPoints with points to match the TeamStats interface
      teamStats.points += playerStat.points || 0;
    });

    // Update match with aggregated team stats
    await Match.findByIdAndUpdate(match._id, { teamStats });

    console.log("Match stats updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating stats after match:", error);
    return false;
  }
};

// **5️⃣ Delete a Match (Admin Only)**
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
