import Player from "../models/Player";
import asyncHandler from "../utils/asyncHandler";
import { AppError } from "../middleware/errorHandler";
import APIFeatures from "../utils/apiFeatures";
import { Request, Response } from "express";
import { TypedRequest } from "../types/express/index";
import {
  IPlayer,
  PlayerDocument,
  PlayerPosition,
} from "../types/models/Player";
import {
  validateRequiredFields,
  validateUnique,
  validateEnum,
  validateArray,
  validateNumberRange,
} from "../utils/validator";

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

interface PaginationData {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

interface PlayersResponse {
  count: number;
  pagination: PaginationData;
  data: PlayerDocument[];
}

interface PlayerResponse {
  data: PlayerDocument;
}

interface DeletePlayerResponse {
  message: string;
}

export const getPlayers = asyncHandler(async (req: Request, res: Response) => {
  const features = new APIFeatures(Player.find(), req.query).filter().sort();

  await features.paginate();

  features.populate();

  const players = await features.query;

  res.status(200).json({
    success: true,
    count: players.length,
    pagination: features.paginationData,
    data: players,
  });
});

export const getPlayer = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    let query = Player.findById(req.params.id);

    if (req.query.populate) {
      const populateFields = (req.query.populate as string).split(",");

      populateFields.forEach((field) => {
        if (field.includes(":")) {
          const [fieldName, selection] = field.split(":");
          const select = selection.replace(/;/g, " ");
          query = query.populate({
            path: fieldName,
            select,
          });
        } else {
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

export const createPlayer = asyncHandler(
  async (req: TypedRequest<PlayerRequestBody>, res: Response) => {
    validateRequiredFields(req.body, ["name", "number", "bornYear"]);
    await validateUnique(Player, "name", req.body.name, "name");
    if (req.body.position) {
      validateArray(req.body.position, 0, 5, "position");
      req.body.position.forEach((pos: string) => {
        validateEnum(
          pos,
          [
            "PointGuard",
            "ShootingGuard",
            "PowerForward",
            "SmallForward",
            "Center",
          ],
          "position"
        );
      });
    }
    validateNumberRange(req.body.number, 0, 99, "number");
    validateNumberRange(
      req.body.bornYear,
      1900,
      new Date().getFullYear(),
      "bornYear"
    );

    const playerData: IPlayer = {
      name: req.body.name,
      number: req.body.number,
      bornYear: req.body.bornYear,
      position: req.body.position,
      height: req.body.height,
      weight: req.body.weight,
      imageUrl: req.body.imageUrl,
    };

    const newPlayer = await Player.create(playerData);

    res.status(201).json({
      success: true,
      data: newPlayer,
    });
  }
);

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
