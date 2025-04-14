import { BaseDocument, ObjectId } from "../index.js";
import { Model } from "mongoose";

export type PlayerPosition =
  | "PointGuard"
  | "ShootingGuard"
  | "PowerForward"
  | "SmallForward"
  | "Center";

export interface IPlayer {
  name: string;
  number: number;
  bornYear: number;
  position?: PlayerPosition[];
  height?: string;
  weight?: number;
  imageUrl?: string;
  statsHistory?: ObjectId[] | string[];
}

export interface PlayerDocument extends BaseDocument, IPlayer {}

export interface PlayerModel extends Model<PlayerDocument> {}
