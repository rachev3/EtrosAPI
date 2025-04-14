import { BaseDocument } from "../index.js";

export type UserRole = "user" | "admin";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface IUserMethods {
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface UserDocument extends BaseDocument, IUser, IUserMethods {}

export interface UserModel {
  new (): UserDocument;
  findById(id: string): Promise<UserDocument | null>;
  findOne(filter: Partial<IUser>): Promise<UserDocument | null>;
  create(data: IUser): Promise<UserDocument>;
}
