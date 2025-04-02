# Database Models Documentation

## Overview

This document describes the database models used in the basketball team API, including their fields, relationships, and population capabilities.

## Models and Their Relationships

### Player Model

Represents a basketball player in the team.

#### Schema Fields:

- `name` (String)

  - Required
  - Unique
  - Trimmed
  - Description: Player's full name

- `number` (Number)

  - Required
  - Description: Player's jersey number

- `bornYear` (Number)

  - Required
  - Description: Player's birth year (e.g., 1990)

- `position` (Array of Strings)

  - Optional
  - Can contain multiple positions from: ["PointGuard", "ShootingGuard", "PowerForward", "SmallForward", "Center"]
  - Example: A player can be both ["PointGuard", "ShootingGuard"]
  - Description: Player's position(s) on the team

- `height` (String)

  - Optional
  - Description: Player's height (e.g., "6'5")

- `weight` (Number)

  - Optional
  - Description: Player's weight in pounds

- `imageUrl` (String)

  - Optional
  - Description: URL to player's profile image

- `statsHistory` (Array of ObjectIds)
  - References: PlayerStats model
  - Description: List of player's statistics from all matches
  - Population: Can be populated to include full stats details
  - Example: `GET /api/players?populate=statsHistory` or `GET /api/players?populate=statsHistory:points,assists`

#### Schema Options

- `timestamps: true`: Automatically manages createdAt and updatedAt

---

### Match Model

Represents a basketball match.

#### Schema Fields:

- `opponent` (String)

  - Required
  - Trimmed
  - Description: Name of the opposing team

- `date` (Date)

  - Required
  - Description: Date and time of the match
  - Note: Seconds and milliseconds are automatically set to 0

- `location` (String)

  - Required
  - Description: Venue of the match

- `status` (String)

  - Enum: ["upcoming", "finished"]
  - Default: "upcoming"
  - Description: Current status of the match

- `result` (String)

  - Enum: ["Win", "Loss", "Pending"]
  - Default: "Pending"
  - Description: Match result

- `ourScore` (Number)

  - Default: null
  - Description: Team's score

- `opponentScore` (Number)

  - Default: null
  - Description: Opponent's score

- `teamStats` (Object)

  - Description: Aggregate statistics for the team
  - Fields:
    - `fieldGoalsMade` (Number, default: 0)
    - `fieldGoalsAttempted` (Number, default: 0)
    - `twoPointsMade` (Number, default: 0)
    - `twoPointsAttempted` (Number, default: 0)
    - `threePointsMade` (Number, default: 0)
    - `threePointsAttempted` (Number, default: 0)
    - `freeThrowsMade` (Number, default: 0)
    - `freeThrowsAttempted` (Number, default: 0)
    - `offensiveRebounds` (Number, default: 0)
    - `defensiveRebounds` (Number, default: 0)
    - `totalRebounds` (Number, default: 0)
    - `assists` (Number, default: 0)
    - `steals` (Number, default: 0)
    - `blocks` (Number, default: 0)
    - `turnovers` (Number, default: 0)
    - `fouls` (Number, default: 0)
    - `points` (Number, default: 0)

- `playerStats` (Array of ObjectIds)
  - References: PlayerStats model
  - Description: Individual statistics for each player in this match
  - Population: Can be populated to include full player stats
  - Example: `GET /api/matches?populate=playerStats` or `GET /api/matches?populate=playerStats.player`

#### Schema Options

- `timestamps: true`: Automatically manages createdAt and updatedAt

---

### PlayerStats Model

Represents individual player statistics for a specific match.

#### Schema Fields:

- `match` (ObjectId)

  - Required
  - References: Match model
  - Description: The match these statistics belong to
  - Population: Can be populated to include match details
  - Example: `GET /api/player-stats?populate=match`

- `player` (ObjectId)

  - Required
  - References: Player model
  - Description: The player these statistics belong to
  - Population: Can be populated to include player details
  - Example: `GET /api/player-stats?populate=player`

- Performance Statistics:
  - `fieldGoalsMade` (Number, default: 0)
  - `fieldGoalsAttempted` (Number, default: 0)
  - `twoPointsMade` (Number, default: 0)
  - `twoPointsAttempted` (Number, default: 0)
  - `threePointsMade` (Number, default: 0)
  - `threePointsAttempted` (Number, default: 0)
  - `freeThrowsMade` (Number, default: 0)
  - `freeThrowsAttempted` (Number, default: 0)
  - `offensiveRebounds` (Number, default: 0)
  - `defensiveRebounds` (Number, default: 0)
  - `totalRebounds` (Number, default: 0)
  - `assists` (Number, default: 0)
  - `steals` (Number, default: 0)
  - `blocks` (Number, default: 0)
  - `turnovers` (Number, default: 0)
  - `fouls` (Number, default: 0)
  - `plusMinus` (Number, default: 0)
  - `efficiency` (Number, default: 0)
  - `points` (Number, default: 0)

#### Schema Options

- `timestamps: true`: Automatically manages createdAt and updatedAt
- `toJSON: { virtuals: true }`: Includes virtual fields when converting to JSON

---

### Article Model

Represents news articles or blog posts.

#### Schema Fields:

- `title` (String)

  - Required
  - Unique
  - Trimmed
  - Description: Article headline

- `content` (String)

  - Required
  - Description: Main content of the article

- `author` (String)

  - Default: "Admin"
  - Description: Author of the article

- `metaTitle` (String)

  - Optional
  - Trimmed
  - Description: SEO meta title

- `metaDescription` (String)

  - Optional
  - Trimmed
  - Description: SEO meta description

- `metaKeywords` (Array of Strings)

  - Default: []
  - Description: SEO keywords

- `images` (Array of Strings)
  - Default: []
  - Description: URLs of images used in the article

#### Schema Options

- `timestamps: true`: Automatically manages createdAt and updatedAt

---

### MatchPdfUpload Model

Represents PDF uploads containing match statistics.

#### Schema Fields:

- `fileName` (String)

  - Required
  - Description: Name of the uploaded PDF file

- `uploadedBy` (ObjectId)

  - Required
  - References: User model
  - Description: User who uploaded the PDF
  - Population: Can be populated to include user details
  - Example: `GET /api/pdf-uploads?populate=uploadedBy`

- `matchDate` (Date)

  - Required
  - Description: Date of the match in the PDF

- `opponent` (String)

  - Required
  - Description: Opponent team name from the PDF

- `processingStatus` (String)

  - Enum: ["pending", "processing", "completed", "failed"]
  - Default: "pending"
  - Description: Current status of PDF processing

- `errorMessage` (String)

  - Optional
  - Description: Error message if processing failed

- `matchId` (ObjectId)

  - Optional
  - References: Match model
  - Description: Associated match after processing
  - Population: Can be populated to include match details
  - Example: `GET /api/pdf-uploads?populate=matchId`

- `createdAt` (Date)
  - Default: Current date
  - Description: Upload timestamp

#### Indexes

- Unique compound index on `matchDate` and `opponent` to prevent duplicate uploads

---

### User Model

Represents a user in the system with authentication capabilities.

#### Schema Fields:

- `username` (String)

  - Required
  - Unique
  - Trimmed
  - Description: User's unique username

- `email` (String)

  - Required
  - Unique
  - Trimmed
  - Lowercase
  - Validated with email regex
  - Description: User's email address

- `password` (String)

  - Required
  - Minimum length: 6 characters
  - Description: Hashed password (automatically hashed before saving)

- `role` (String)
  - Enum: ["user", "admin"]
  - Default: "user"
  - Description: User's role for authorization

#### Schema Options

- `timestamps: true`: Automatically manages createdAt and updatedAt

#### Methods

- `matchPassword(enteredPassword)`: Compares entered password with stored hash

### Comment Model

Represents user comments on articles.

#### Schema Fields:

- `content` (String)

  - Required
  - Trimmed
  - Description: The content of the comment

- `author` (ObjectId)

  - Required
  - References: User model
  - Description: The user who created the comment
  - Population: Can be populated to include user details
  - Example: `GET /api/comments?populate=author`

- `article` (ObjectId)

  - Required
  - References: Article model
  - Description: The article the comment belongs to
  - Population: Can be populated to include article details
  - Example: `GET /api/comments?populate=article`

- `isVisible` (Boolean)
  - Default: true
  - Description: Visibility status of the comment

#### Schema Options

- `timestamps: true`: Automatically manages createdAt and updatedAt

#### Authorization

- Only authenticated users can create comments
- Only the comment author can update or delete their own comments
- Comments cannot be modified by other users or admins

#### Indexes

- Index on `article` and `createdAt` for efficient article comment queries
- Index on `author` for efficient user comment queries

## Model Relationships Overview

### Direct References

- PlayerStats → Player (one-to-one)
- PlayerStats → Match (one-to-one)
- MatchPdfUpload → User (one-to-one)
- MatchPdfUpload → Match (one-to-one)
- Comment → User (one-to-one)
- Comment → Article (one-to-one)

### Array References

- Player → PlayerStats (one-to-many)
- Match → PlayerStats (one-to-many)

### Population Examples

```
# Get player with all stats
GET /api/players/123?populate=statsHistory

# Get match with all player stats and their players
GET /api/matches/123?populate=playerStats.player

# Get player stats with both player and match details
GET /api/player-stats?populate=player,match

# Get PDF upload with user and match details
GET /api/pdf-uploads?populate=uploadedBy,matchId

# Get comments with author details
GET /api/comments?populate=author

# Get comments with article details
GET /api/comments?populate=article

# Get comments with both author and article details
GET /api/comments?populate=author,article

# Get article comments sorted by creation date
GET /api/comments/article/{articleId}?sort=-createdAt

# Get user comments with article details
GET /api/comments/user/{userId}?populate=article
```
