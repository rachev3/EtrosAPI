import Player from "../models/Player.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";
import APIFeatures from "../utils/apiFeatures.js";
import { Request, Response } from "express";
import { TypedRequest } from "../types/express/index.js";
import {
  IPlayer,
  PlayerDocument,
  PlayerPosition,
} from "../types/models/Player.js";

// Interface for player creation/update request body
interface PlayerRequestBody {
  name: string;
  number: number;
  bornYear: number;
  position?: PlayerPosition[];
  height?: string;
  weight?: number;
  stats?: string[];
  imageUrl?: string;
}

// Interface for pagination data in response
interface PaginationData {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

// Interface for player list response
interface PlayersResponse {
  count: number;
  pagination: PaginationData;
  data: PlayerDocument[];
}

// Interface for single player response
interface PlayerResponse {
  data: PlayerDocument;
}

// Interface for delete player response
interface DeletePlayerResponse {
  message: string;
}

// **1️⃣ Get All Players**
export const getPlayers = asyncHandler(async (req: Request, res: Response) => {
  // Create a new APIFeatures instance with the Player model query and request query
  const features = new APIFeatures(Player.find(), req.query).filter().sort();

  // Apply pagination
  await features.paginate();

  // Apply population if requested
  features.populate();

  const players = await features.query;

  // Return response with pagination data
  res.status(200).json({
    success: true,
    count: players.length,
    pagination: features.paginationData,
    data: players,
  });
});

// **2️⃣ Get a Single Player**
export const getPlayer = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    // Create a base query
    let query = Player.findById(req.params.id);

    // Apply population if requested
    if (req.query.populate) {
      const populateFields = (req.query.populate as string).split(",");

      populateFields.forEach((field) => {
        // Check if there's a selection specified with field:selection
        if (field.includes(":")) {
          const [fieldName, selection] = field.split(":");
          // Convert selection to space-separated string for mongoose
          const select = selection.replace(/;/g, " ");
          query = query.populate({
            path: fieldName,
            select,
          });
        } else {
          // Simple population without selection
          query = query.populate(field);
        }
      });
    }

    const player = await query;

    if (!player) {
      throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");
    }

    res.status(200).json({
      success: true,
      data: player,
    });
  }
);

// **3️⃣ Create a New Player (Admin Only)**
export const createPlayer = asyncHandler(
  async (req: TypedRequest<PlayerRequestBody>, res: Response) => {
    const {
      name,
      number,
      position,
      height,
      weight,
      stats,
      bornYear,
      imageUrl,
    } = req.body;

    // Validate required fields
    if (!name) {
      throw new AppError("Name is required", 400, "MISSING_FIELDS", {
        field: "name",
      });
    }

    if (!number) {
      throw new AppError("Number is required", 400, "MISSING_FIELDS", {
        field: "number",
      });
    }

    if (!bornYear) {
      throw new AppError("Born year is required", 400, "MISSING_FIELDS", {
        field: "bornYear",
      });
    }

    // Check if player already exists
    const playerExists = await Player.findOne({ name });
    if (playerExists) {
      throw new AppError(
        "Player with this name already exists",
        409,
        "PLAYER_EXISTS"
      );
    }

    // Create new player
    const playerData: IPlayer = {
      name,
      number,
      bornYear,
      position,
      height,
      weight,
      imageUrl,
    };

    const newPlayer = await Player.create(playerData);

    res.status(201).json({
      success: true,
      data: newPlayer,
    });
  }
);

// **4️⃣ Update a Player (Admin Only)**
export const updatePlayer = asyncHandler(
  async (
    req: TypedRequest<Partial<PlayerRequestBody>, { id: string }>,
    res: Response
  ) => {
    const updatedPlayer = await Player.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPlayer) {
      throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");
    }

    res.status(200).json({
      success: true,
      data: updatedPlayer,
    });
  }
);

// **5️⃣ Delete a Player (Admin Only)**
export const deletePlayer = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const player = await Player.findByIdAndDelete(req.params.id);

    if (!player) {
      throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");
    }

    res.status(200).json({
      success: true,
      data: {
        message: "Player deleted successfully",
      },
    });
  }
);
