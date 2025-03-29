import Player from "../models/Player.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";
import APIFeatures from "../utils/apiFeatures.js";

// **1️⃣ Get All Players**
export const getPlayers = asyncHandler(async (req, res) => {
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
export const getPlayer = asyncHandler(async (req, res) => {
  // Create a base query
  let query = Player.findById(req.params.id);

  // Apply population if requested
  if (req.query.populate) {
    const populateFields = req.query.populate.split(",");

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
});

// **3️⃣ Create a New Player (Admin Only)**
export const createPlayer = asyncHandler(async (req, res) => {
  const { name, number, position, height, weight, stats, bornYear, imageUrl } =
    req.body;

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
  const newPlayer = await Player.create({
    name,
    number,
    bornYear,
    position,
    height,
    weight,
    stats,
    imageUrl,
  });

  res.status(201).json({
    success: true,
    data: newPlayer,
  });
});

// **4️⃣ Update a Player (Admin Only)**
export const updatePlayer = asyncHandler(async (req, res) => {
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
});

// **5️⃣ Delete a Player (Admin Only)**
export const deletePlayer = asyncHandler(async (req, res) => {
  const player = await Player.findByIdAndDelete(req.params.id);

  if (!player) {
    throw new AppError("Player not found", 404, "PLAYER_NOT_FOUND");
  }

  res.status(200).json({
    success: true,
    message: "Player deleted successfully",
  });
});
