import Player from "../models/Player";
import { IPlayer, PlayerDocument } from "../types/models/Player";
import { AppError } from "../middleware/errorHandler";

export async function createPlayer(data: IPlayer): Promise<PlayerDocument> {
  const playerExists = await Player.findOne({ name: data.name });
  if (playerExists) {
    throw new AppError(
      "Player with this name already exists",
      409,
      "PLAYER_EXISTS"
    );
  }
  const player = await Player.create(data);
  return player;
}

export async function updatePlayer(
  id: string,
  data: Partial<IPlayer>
): Promise<PlayerDocument> {
  if (data.name) {
    const existingPlayer = await Player.findOne({
      name: data.name,
      _id: { $ne: id },
    });
    if (existingPlayer) {
      throw new AppError(
        "Player with this name already exists",
        409,
        "PLAYER_EXISTS"
      );
    }
  }
  const updatedPlayer = await Player.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!updatedPlayer) {
    throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");
  }
  return updatedPlayer;
}

export async function deletePlayer(id: string): Promise<void> {
  const player = await Player.findByIdAndDelete(id);
  if (!player) {
    throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");
  }
}

export async function getPlayer(id: string): Promise<PlayerDocument> {
  const player = await Player.findById(id);
  if (!player) {
    throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");
  }
  return player;
}
