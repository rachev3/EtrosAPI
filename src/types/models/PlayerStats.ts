import { BaseDocument, ObjectId } from "../index.js";
import { Model } from "mongoose";

export interface IPlayerStats {
  match: ObjectId | string;
  player: ObjectId | string;
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
  plusMinus: number;
  efficiency: number;
  points: number;
}

export interface PlayerStatsDocument extends BaseDocument, IPlayerStats {}

export interface PlayerStatsModel extends Model<PlayerStatsDocument> {}
