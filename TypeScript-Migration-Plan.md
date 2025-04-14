# TypeScript Migration Plan for Etros API

This migration plan outlines the process of converting the Etros API project from JavaScript to TypeScript. Each step is designed to be independent, allowing the application to remain functional throughout the migration process.

## Prerequisites

- [x] TypeScript and related type definitions are already installed (as shown in package.json)
- [x] tsconfig.json is already configured

## Step 1: Create Base Type Definitions

- [x] Create src/types/index.ts with shared interfaces
- [x] Define model interfaces
  - [x] Create src/types/models/User.ts
  - [x] Create src/types/models/Player.ts
  - [x] Create src/types/models/PlayerStats.ts
  - [x] Create src/types/models/Match.ts
  - [x] Create src/types/models/Article.ts
  - [x] Create src/types/models/Comment.ts
- [x] Define request/response interfaces
  - [x] Create src/types/express/index.ts with extended request interfaces

## Step 2: Convert Configuration Files

- [x] Convert src/config/ directory files to TypeScript
  - [x] Identify all configuration files
  - [x] Add type annotations
  - [x] Rename .js files to .ts

## Step 3: Convert Utility Functions

- [x] Convert src/utils/ directory files to TypeScript
  - [x] Add type annotations
  - [x] Rename .js files to .ts

## Step 4: Convert Models

- [x] Convert src/models/User.js to User.ts
- [x] Convert src/models/Player.js to Player.ts
- [x] Convert src/models/PlayerStats.js to PlayerStats.ts
- [x] Convert src/models/Match.js to Match.ts
- [x] Convert src/models/Article.js to Article.ts
- [x] Convert src/models/Comment.js to Comment.ts

## Step 5: Convert Middleware

- [x] Convert src/middleware/ directory files to TypeScript
  - [x] Add type annotations for request and response objects
  - [x] Rename .js files to .ts

## Step 6: Convert Controllers

- [x] Convert src/controllers/authController.js to authController.ts
- [x] Convert src/controllers/playerController.js to playerController.ts
- [x] Convert src/controllers/playerStatsController.js to playerStatsController.ts
- [x] Convert src/controllers/matchController.js to matchController.ts
- [x] Convert src/controllers/articleController.js to articleController.ts
- [x] Convert src/controllers/commentController.js to commentController.ts
- [x] Convert src/controllers/imageController.js to imageController.ts

## Step 7: Convert Routes

- [x] Convert src/routes/ directory files to TypeScript
  - [x] Add type annotations
  - [x] Rename .js files to .ts

## Step 8: Convert Main Application Files

- [x] Convert src/app.js to app.ts
- [x] Convert src/server.js to server.ts
- [x] Test that the TypeScript files compile correctly
- [x] Create a dist/ directory for compiled JavaScript

## Step 9: Update Project Configuration

- [x] Update package.json scripts to use TypeScript:
  ```json
  "scripts": {
    "start": "node dist/server.js",
    "dev": "cross-env NODE_OPTIONS=--loader=ts-node/esm nodemon src/server.ts",
    "build": "tsc",
    "seed": "cross-env NODE_OPTIONS=--loader=ts-node/esm ts-node src/utils/seeder.ts"
  }
  ```
- [x] Run the build script to ensure everything compiles
- [x] Test the application with the new TypeScript setup

## Step 10: Testing and Validation

- [x] Test the application thoroughly
- [x] Run TypeScript compiler to check for type errors
- [x] Fix any identified type issues

## Step 11: Enable Stricter TypeScript Settings

- [x] Update tsconfig.json to enable stricter type checking:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true
    }
  }
  ```
- [x] Fix initial type errors that appear
- [x] Implement a phased approach to stricter type checking
  - [x] Created utility types (ControllerHandler, IdParam, etc.) for common patterns
  - [x] Updated asyncHandler to work with TypeScript generics
  - [x] Temporarily reduced strictness to complete the migration
  - [ ] Incrementally enable strict checks in future updates

## Step 12: Additional Improvements

- [x] Add JSDoc comments to functions and classes
- [x] Implement error handling with typed error classes
- [x] Create custom type guards where needed
- [x] Improve code organization using TypeScript features

## Guidelines for Converting Each File

1. **Create Type Definitions First**: Start by defining interfaces for the data structures
2. **Handle Imports/Exports**: Update import/export syntax for TypeScript
3. **Add Type Annotations**: Add types to:
   - Function parameters and return types
   - Variables
   - Object properties
4. **Handle Mongoose Models**: Use proper TypeScript interfaces with Mongoose
5. **Handle Express**: Use extended types for Request and Response objects
6. **Test Incrementally**: After converting each file, test to ensure functionality remains intact

## Notes

- Keep ES modules syntax (project uses `"type": "module"`)
- Use the TypeScript ESM support via `"module": "NodeNext"` in tsconfig.json
- The migration should be done incrementally, file by file, to maintain application stability
- During the migration process, you can continue running the JavaScript version until Step 9
- Each converted TypeScript file can coexist with JavaScript files until the final switch
