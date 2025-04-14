import dotenv from "dotenv";
import path from "path";
import { Secret } from "jsonwebtoken";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function getEnvVariable(key: string, required: true): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not set.`);
  }
  return value;
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),

  JWT_SECRET: getEnvVariable("JWT_SECRET", true) as Secret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",

  MONGO_URI: getEnvVariable("MONGO_URI", true) as string,
};
