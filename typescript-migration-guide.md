# TypeScript Migration Guide for Etros API

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Migration Steps](#migration-steps)
4. [TypeScript Configuration](#typescript-configuration)
5. [Converting Files](#converting-files)
   - [Initial Setup](#initial-setup)
   - [Models](#models)
   - [Routes](#routes)
   - [Controllers](#controllers)
   - [Middleware](#middleware)
   - [Utils](#utils)
   - [Config](#config)
   - [Core Files](#core-files)
6. [Additional Type Definitions](#additional-type-definitions)
7. [Testing](#testing)
8. [Best Practices](#best-practices)

## Project Overview

This is a Node.js Express API with the following features:

- User authentication (register, login)
- Players management
- Matches data
- Articles
- Image uploads
- Player stats
- Comments

The project uses:

- Express.js for the web server
- MongoDB with Mongoose for data storage
- JWT for authentication
- ES modules (import/export)

## Prerequisites

Before starting the migration, ensure you have:

1. Install TypeScript and related dependencies:

```bash
npm install --save-dev typescript @types/node @types/express @types/cors @types/jsonwebtoken @types/bcrypt @types/mongoose @types/multer ts-node
```

2. Install Express.js type definitions:

```bash
npm install --save-dev @types/express
```

## TypeScript Configuration

1. Create a `tsconfig.json` file in the root directory:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "sourceMap": true,
    "declaration": true,
    "noImplicitAny": false,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

2. Update `package.json` to include TypeScript scripts:

```json
{
  "scripts": {
    "start": "node dist/server.js",
    "dev": "ts-node-dev --respawn src/server.ts",
    "build": "tsc",
    "seed": "ts-node src/utils/seeder.ts"
  }
}
```

## Migration Steps

### 1. Initial Setup

1. Create a base `src/types` directory for shared type definitions:

```typescript
// src/types/index.ts
export interface RequestWithUser extends Request {
  user?: any;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface AppErrorDetails {
  [key: string]: any;
}
```

### 2. Converting Files

#### Models

Example - User.js to User.ts:

```typescript
// src/models/User.ts
import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";
import { User as IUser } from "../types";

export interface UserDocument extends IUser, Document {}

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User: Model<UserDocument> = mongoose.model<UserDocument>(
  "User",
  userSchema
);

export default User;
```

#### Routes

Example - authRoutes.js to authRoutes.ts:

```typescript
// src/routes/authRoutes.ts
import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/user", protect, getUserProfile);

export default router;
```

#### Controllers

Example - authController.js to authController.ts:

```typescript
// src/controllers/authController.ts
import { Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import asyncHandler from "../utils/asyncHandler";
import { AppError } from "../middleware/errorHandler";
import { RequestWithUser } from "../types";

dotenv.config();

// Generate JWT Token
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

// User Registration
export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new AppError(
        "Please provide all required fields",
        400,
        "MISSING_FIELDS",
        {
          missingFields: Object.entries({ username, email, password })
            .filter(([_, value]) => !value)
            .map(([key]) => key),
        }
      );
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new AppError(
        "User already exists with this email",
        409,
        "USER_EXISTS"
      );
    }

    const user = await User.create({ username, email, password });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  }
);

// User Login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(
      "Please provide email and password",
      400,
      "MISSING_CREDENTIALS"
    );
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

// Get User Profile (Protected Route)
export const getUserProfile = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    res.json({
      success: true,
      data: user,
    });
  }
);
```

#### Middleware

Example - authMiddleware.js to authMiddleware.ts:

```typescript
// src/middleware/authMiddleware.ts
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import asyncHandler from "../utils/asyncHandler";
import { AppError } from "./errorHandler";
import { RequestWithUser } from "../types";

interface JwtPayload {
  id: string;
}

export const protect = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError("Not authorized, no token", 401, "NO_TOKEN");
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      throw new AppError("Not authorized, token failed", 401, "INVALID_TOKEN");
    }
  }
);

export const admin = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    throw new AppError("Not authorized as admin", 403, "NOT_ADMIN");
  }
};
```

#### Core Files

Example - app.js to app.ts:

```typescript
// src/app.ts
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// import Routes
import authRoutes from "./routes/authRoutes";
import playerRoutes from "./routes/playerRoutes";
import matchRoutes from "./routes/matchRoutes";
import articleRoutes from "./routes/articleRoutes";
import imageRoutes from "./routes/imageRoutes";
import playerStatsRoutes from "./routes/playerStatsRoutes";
import commentRoutes from "./routes/commentRoutes";

// import middleware
import errorHandler from "./middleware/errorHandler";

// Load Environment Variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/player-stats", playerStatsRoutes);
app.use("/api/comments", commentRoutes);

// 404 handler for undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  (error as any).statusCode = 404;
  next(error);
});

// Error handling middleware (must be the last middleware)
app.use(errorHandler);

export default app;
```

Example - server.js to server.ts:

```typescript
// src/server.ts
import app from "./app";
import connectDB from "./config/db";

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB()
  .then(() => {
    // Start the Server only after the DB is connected
    app.listen(PORT, () =>
      console.log(`Server running on port http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });
```

## Additional Type Definitions

Create additional type definitions as needed:

```typescript
// src/types/express.d.ts
import { User } from "./index";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
```

## Testing

1. After converting files, run TypeScript to check for errors:

```bash
npx tsc --noEmit
```

2. Start the application in development mode to verify functionality:

```bash
npm run dev
```

## Best Practices

1. **Gradual Migration**: Convert one module at a time, starting with models and core utilities.
2. **Type Definitions**: Create comprehensive types for each entity in your system.
3. **Strict Mode**: Begin with `"strict": false` in tsconfig.json, then gradually enable strict mode once your codebase is stable.
4. **Interfaces vs. Types**: Use interfaces for object shapes that might be extended, and types for unions, primitives, or object shapes that won't be extended.
5. **Avoid any**: Try to avoid using the `any` type except when necessary.
6. **Leverage TypeScript Utilities**: Make use of built-in utility types like `Partial<T>`, `Pick<T>`, `Omit<T>`, etc.

## Migration Checklist

- [ ] Install TypeScript and type definitions
- [ ] Create tsconfig.json
- [ ] Update package.json scripts
- [ ] Create base type definitions
- [ ] Migrate models
- [ ] Migrate utility functions
- [ ] Migrate middleware
- [ ] Migrate controllers
- [ ] Migrate routes
- [ ] Migrate core application files
- [ ] Test the application
- [ ] Enable strict mode in tsconfig.json
