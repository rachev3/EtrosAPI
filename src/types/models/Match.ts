import { BaseDocument, ObjectId } from "../index.js";
import { Model } from "mongoose";

export type MatchStatus = "upcoming" | "finished";
export type MatchResult = "Win" | "Loss" | "Pending";

export interface TeamStats {
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  twoPointsMade: number;
  twoPointsAttempted: number;
  threePointsMade: number;
  threePointsAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  offensiveRebounds: number;
  defensiveRebounds: number;
  totalRebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  points: number;
}

export interface IMatch {
  opponent: string;
  date: Date;
  location: string;
  status: MatchStatus;
  result: MatchResult;
  ourScore: number | null;
  opponentScore: number | null;
  teamStats: TeamStats;
  playerStats: ObjectId[] | string[];
}

export interface MatchDocument extends BaseDocument, IMatch {}

export interface MatchModel extends Model<MatchDocument> {}
