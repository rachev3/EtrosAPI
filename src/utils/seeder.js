import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";

import User from "../models/User.js";
import Player from "../models/Player.js";
import Match from "../models/Match.js";
import Article from "../models/Article.js";
import Stats from "../models/Stats.js";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log("Database connected...");

    // Clear existing data
    await User.deleteMany();
    await Player.deleteMany();
    await Match.deleteMany();
    await Article.deleteMany();
    await Stats.deleteMany();

    console.log("Existing data cleared!");

    const adminUser = await User.create({
      username: "admin",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    });

    console.log("Admin user created!");

    // **2️⃣ Add Sample Players**
    const players = [
      {
        name: "John Doe",
        position: "Guard",
        height: "6'3",
        weight: 190,
        stats: { points: 22, rebounds: 5, assists: 7, steals: 2, blocks: 1 },
      },
      {
        name: "Michael Smith",
        position: "Forward",
        height: "6'8",
        weight: 220,
        stats: { points: 18, rebounds: 8, assists: 4, steals: 1, blocks: 2 },
      },
      {
        name: "James White",
        position: "Center",
        height: "7'0",
        weight: 250,
        stats: { points: 15, rebounds: 12, assists: 3, steals: 0, blocks: 3 },
      },
    ];

    const createdPlayers = await Player.insertMany(players);
    console.log(`${createdPlayers.length} players added!`);

    // **3️⃣ Add Sample Matches**
    const matches = [
      {
        opponent: "Team A",
        date: new Date(),
        venue: "Home",
        result: "Win",
        score: "89-76",
      },
      {
        opponent: "Team B",
        date: new Date(),
        venue: "Away",
        result: "Loss",
        score: "82-85",
      },
    ];

    const createdMatches = await Match.insertMany(matches);
    console.log(`${createdMatches.length} matches added!`);

    // **4️⃣ Add Sample Articles**
    const articles = [
      {
        title: "Big Victory for Our Team!",
        content: "Our team won a thrilling match against Team A!",
        author: "Coach John",
      },
      {
        title: "Upcoming Championship Game",
        content: "We are preparing for the championship finals!",
        author: "Admin",
      },
    ];

    const createdArticles = await Article.insertMany(articles);
    console.log(`${createdArticles.length} articles added!`);

    // **5️⃣ Add Sample Team Stats**
    const stats = await Stats.create({
      season: "2023-2024",
      totalMatches: matches.length,
      totalWins: matches.filter((m) => m.result === "Win").length,
      totalLosses: matches.filter((m) => m.result === "Loss").length,
      winPercentage:
        (
          (matches.filter((m) => m.result === "Win").length / matches.length) *
          100
        ).toFixed(2) + "%",
      topScorer: {
        playerId: createdPlayers[0]._id,
        name: createdPlayers[0].name,
        pointsPerGame: createdPlayers[0].stats.points,
      },
    });

    console.log("Team stats added!");

    console.log("✅ Database successfully populated!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
