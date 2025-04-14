import dotenv from "dotenv";
import path from "path";
import { Secret } from "jsonwebtoken";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function getEnvVariable(key: string, required = true): string {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`${key} is not set.`);
  }
  return value as string;
}

export const ENV = {
  NODE_ENV: getEnvVariable("NODE_ENV", true) || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),

  JWT_SECRET: getEnvVariable("JWT_SECRET", true) as Secret,
  JWT_EXPIRES_IN: getEnvVariable("JWT_EXPIRES_IN", true) || "1h",

  CLOUDINARY_CLOUD_NAME: getEnvVariable("CLOUDINARY_CLOUD_NAME", true),
  CLOUDINARY_API_KEY: getEnvVariable("CLOUDINARY_API_KEY", true),
  CLOUDINARY_API_SECRET: getEnvVariable("CLOUDINARY_API_SECRET", true),

  MONGO_URI: getEnvVariable("MONGO_URI", true),
};
