# Database Models Documentation

## User Model

Represents a user in the system with authentication capabilities.

### Schema Fields:

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

### Timestamps

- `createdAt`: Date when the user was created
- `updatedAt`: Date when the user was last updated

### Methods

- `matchPassword(enteredPassword)`: Compares entered password with stored hash

---

## Player Model

Represents a basketball player in the team.

### Schema Fields:

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
  - Enum: ["PointGuard", "ShootingGuard", "PowerForward", "SmallForward", "Center"]
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

### Timestamps

- `createdAt`: Date when the player was added
- `updatedAt`: Date when the player was last updated

---

## Match Model

Represents a basketball match.

### Schema Fields:

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
    - `totalAssists` (Number, default: 0)
    - `totalSteals` (Number, default: 0)
    - `totalBlocks` (Number, default: 0)
    - `totalTurnovers` (Number, default: 0)
    - `totalFouls` (Number, default: 0)
    - `totalPoints` (Number, default: 0)

- `playerStats` (Array of ObjectIds)
  - References: PlayerStats model
  - Description: Individual statistics for each player in this match

### Timestamps

- `createdAt`: Date when the match was created
- `updatedAt`: Date when the match was last updated

---

## PlayerStats Model

Represents individual player statistics for a specific match.

### Schema Fields:

- `match` (ObjectId)

  - Required
  - References: Match model
  - Description: The match these statistics belong to

- `player` (ObjectId)

  - Required
  - References: Player model
  - Description: The player these statistics belong to

- Performance Statistics:
  - `fieldGoalsMade` (Number, default: 0)
  - `fieldgoalsAttempted` (Number, default: 0)
  - `twoPointsMade` (Number, default: 0)
  - `twoPointsAttempted` (Number, default: 0)
  - `threePointsMade` (Number, default: 0)
  - `threePointsAttempted` (Number, default: 0)
  - `freeThrowsMade` (Number, default: 0)
  - `freeThrowsAttempted` (Number, default: 0)
  - `offensiveRebounds` (Number, default: 0)
  - `defensiveRebounds` (Number, default: 0)
  - `totalAssists` (Number, default: 0)
  - `totalSteals` (Number, default: 0)
  - `totalBlocks` (Number, default: 0)
  - `totalTurnovers` (Number, default: 0)
  - `totalFouls` (Number, default: 0)
  - `plusMinus` (Number, default: 0)
  - `efficiency` (Number, default: 0)
  - `totalPoints` (Number, default: 0)

### Timestamps

- `createdAt`: Date when the stats were recorded
- `updatedAt`: Date when the stats were last updated

---

## Article Model

Represents news articles or blog posts.

### Schema Fields:

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

### Timestamps

- `createdAt`: Date when the article was published
- `updatedAt`: Date when the article was last modified

---

## MatchPdfUpload Model

Represents PDF uploads containing match statistics.

### Schema Fields:

- `fileName` (String)

  - Required
  - Description: Name of the uploaded PDF file

- `uploadedBy` (ObjectId)

  - Required
  - References: User model
  - Description: User who uploaded the PDF

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

- `createdAt` (Date)
  - Default: Current date
  - Description: Upload timestamp

### Indexes

- Unique compound index on `matchDate` and `opponent` to prevent duplicate uploads
