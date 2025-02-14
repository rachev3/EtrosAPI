import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";

import User from "../models/User.js";
import Player from "../models/Player.js";
import Match from "../models/Match.js";
import Article from "../models/Article.js";
import PlayerStats from "../models/PlayerStats.js";
import Stats from "../models/Stats.js";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected...");

    // **Drop collections if they exist**
    await mongoose.connection.db.dropDatabase();
    console.log("✅ Database reset!");

    // Create an Admin User
    const adminUser = await User.create({
      username: "admin",
      email: "admin@example.com",
      password: bcrypt.hashSync("admin123", 10),
      role: "admin",
    });

    console.log("✅ Admin user created!");

    // Add Sample Players
    const players = await Player.insertMany([
      {
        name: "John Doe",
        position: ["PointGuard"],
        height: "6'3",
        weight: 190,
        bornYear: 1998,
        imageUrl: "https://example.com/john_doe.jpg",
      },
      {
        name: "Michael Smith",
        position: ["ShootingGuard", "SmallForward"],
        height: "6'5",
        weight: 210,
        bornYear: 2000,
        imageUrl: "https://example.com/michael_smith.jpg",
      },
      {
        name: "David Brown",
        position: ["Center"],
        height: "7'0",
        weight: 250,
        bornYear: 1995,
        imageUrl: "https://example.com/david_brown.jpg",
      },
    ]);

    console.log(`✅ ${players.length} players added!`);

    // Add Sample Matches
    const matches = await Match.insertMany([
      {
        opponent: "Team A",
        date: new Date(),
        location: "Home",
        result: "Win",
        ourScore: 89,
        opponentScore: 76,
        teamStats: {
          fieldGoalsMade: 35,
          fieldgoalsAttempted: 75,
          twoPointsMade: 25,
          twoPointsAttempted: 50,
          threePointsMade: 10,
          threePointsAttempted: 25,
          freeThrowsMade: 9,
          freeThrowsAttempted: 12,
          offensiveRebounds: 10,
          defensiveRebounds: 25,
          totalAssists: 20,
          totalSteals: 8,
          totalBlocks: 4,
          totalTurnovers: 12,
          totalFouls: 15,
          totalPoints: 89,
        },
      },
      {
        opponent: "Team B",
        date: new Date(),
        location: "Away",
        result: "Loss",
        ourScore: 82,
        opponentScore: 85,
        teamStats: {
          fieldGoalsMade: 30,
          fieldgoalsAttempted: 70,
          twoPointsMade: 22,
          twoPointsAttempted: 45,
          threePointsMade: 8,
          threePointsAttempted: 25,
          freeThrowsMade: 14,
          freeThrowsAttempted: 18,
          offensiveRebounds: 8,
          defensiveRebounds: 22,
          totalAssists: 18,
          totalSteals: 5,
          totalBlocks: 2,
          totalTurnovers: 10,
          totalFouls: 13,
          totalPoints: 82,
        },
      },
    ]);

    console.log(`✅ ${matches.length} matches added!`);

    // Add Sample Player Stats for Each Match
    const playerStats = await PlayerStats.insertMany([
      {
        match: matches[0]._id,
        player: players[0]._id,
        fieldGoalsMade: 10,
        fieldgoalsAttempted: 20,
        twoPointsMade: 7,
        twoPointsAttempted: 12,
        threePointsMade: 3,
        threePointsAttempted: 8,
        freeThrowsMade: 5,
        freeThrowsAttempted: 6,
        offensiveRebounds: 2,
        defensiveRebounds: 5,
        totalAssists: 6,
        totalSteals: 2,
        totalBlocks: 1,
        totalTurnovers: 3,
        totalFouls: 2,
        plusMinus: 12,
        efficiency: 20,
        totalPoints: 28,
      },
      {
        match: matches[0]._id,
        player: players[1]._id,
        fieldGoalsMade: 8,
        fieldgoalsAttempted: 15,
        twoPointsMade: 5,
        twoPointsAttempted: 10,
        threePointsMade: 3,
        threePointsAttempted: 5,
        freeThrowsMade: 4,
        freeThrowsAttempted: 4,
        offensiveRebounds: 1,
        defensiveRebounds: 6,
        totalAssists: 5,
        totalSteals: 1,
        totalBlocks: 0,
        totalTurnovers: 2,
        totalFouls: 3,
        plusMinus: 8,
        efficiency: 15,
        totalPoints: 23,
      },
    ]);

    console.log(`✅ ${playerStats.length} player stats added!`);

    // Add Sample Articles
    const articles = await Article.insertMany([
      {
        title: "Big Victory for Our Team!",
        content: "Our team won a thrilling match against Team A!",
        author: "Coach John",
        metaTitle: "Basketball Victory",
        metaDescription: "Recap of our thrilling win against Team A.",
        metaKeywords: ["basketball", "victory", "team win"],
        images: [
          "https://example.com/win1.jpg",
          "https://example.com/win2.jpg",
        ],
      },
      {
        title: "Upcoming Championship Game",
        content: "We are preparing for the championship finals!",
        author: "Admin",
        metaTitle: "Championship Finals",
        metaDescription:
          "Our team is ready for the upcoming championship game.",
        metaKeywords: ["championship", "finals", "basketball"],
        images: ["https://example.com/championship.jpg"],
      },
    ]);

    console.log(`✅ ${articles.length} articles added!`);

    // Calculate Team Stats
    const totalMatches = matches.length;
    const totalWins = matches.filter((m) => m.result === "Win").length;
    const totalLosses = matches.filter((m) => m.result === "Loss").length;
    const winPercentage = ((totalWins / totalMatches) * 100).toFixed(2);

    await Stats.create({
      season: "2023-2024",
      totalMatches,
      totalWins,
      totalLosses,
      winPercentage: `${winPercentage}%`,
      topScorer: {
        playerId: players[0]._id,
        name: players[0].name,
        pointsPerGame: 28,
      },
    });

    console.log("✅ Team stats added!");

    console.log("🎉 Database successfully populated!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
