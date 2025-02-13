import Match from "../models/Match.js";

// **1️⃣ Get All Matches**
export const getMatches = async (req, res) => {
  try {
    const matches = await Match.find().sort({ date: -1 }); // Sort by latest match
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// **2️⃣ Get a Single Match**
export const getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// **3️⃣ Create a New Match (Admin Only)**
export const createMatch = async (req, res) => {
  try {
    const { opponent, date, venue, result, score } = req.body;

    const newMatch = await Match.create({
      opponent,
      date,
      venue,
      result,
      score,
    });

    // **Update Team Stats**
    if (result !== "Pending") {
      await updateStatsAfterMatch(newMatch);
    }

    res.status(201).json(newMatch);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// **Update Match Result (Admin Only)**
export const updateMatch = async (req, res) => {
  try {
    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedMatch) {
      return res.status(404).json({ message: "Match not found" });
    }

    // **Update Team Stats if match result changes**
    if (req.body.result && req.body.result !== "Pending") {
      await updateStatsAfterMatch(updatedMatch);
    }

    res.status(200).json(updatedMatch);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// **5️⃣ Delete a Match (Admin Only)**
export const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.status(200).json({ message: "Match deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
