import Player from "../models/Player.js";

// **1️⃣ Get All Players**
export const getPlayers = async (req, res) => {
  try {
    const players = await Player.find();
    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// **2️⃣ Get a Single Player**
export const getPlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.status(200).json(player);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// **3️⃣ Create a New Player (Admin Only)**
export const createPlayer = async (req, res) => {
  try {
    const { name, position, height, weight, stats, bornYear } = req.body;

    // Check if player already exists
    const playerExists = await Player.findOne({ name });
    if (playerExists) {
      return res.status(400).json({ message: "Player already exists" });
    }

    // Create new player
    const newPlayer = await Player.create({
      name,
      bornYear,
      position,
      height,
      weight,
      stats,
    });

    res.status(201).json(newPlayer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// **4️⃣ Update a Player (Admin Only)**
export const updatePlayer = async (req, res) => {
  try {
    const updatedPlayer = await Player.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedPlayer) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.status(200).json(updatedPlayer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// **5️⃣ Delete a Player (Admin Only)**
export const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.status(200).json({ message: "Player deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
