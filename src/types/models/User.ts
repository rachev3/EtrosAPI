import { Document, Model, Types } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface UserDocument extends Document, IUser, IUserMethods {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserModel extends Model<UserDocument> {}
