# API Filtering Documentation

The API supports advanced filtering capabilities across all resources. This document explains how to use various filtering operators and provides examples for each model.

## Basic Filtering

Simple equality filtering can be done by providing the field and value directly:

```
GET /api/players?number=23
GET /api/articles?author=Admin
GET /api/matches?location=Home
```

## Comparison Operators

The following comparison operators are supported:

- `[gt]` - Greater than
- `[gte]` - Greater than or equal to
- `[lt]` - Less than
- `[lte]` - Less than or equal to

Examples:

```
# Players born after 1995
GET /api/players?bornYear[gt]=1995

# Players with weight less than or equal to 200 lbs
GET /api/players?weight[lte]=200

# Matches with our score greater than 100
GET /api/matches?ourScore[gt]=100

# Player stats with efficiency rating greater than or equal to 20
GET /api/player-stats?efficiency[gte]=20
```

## Array Field Operators

For fields that contain arrays (like player positions), two special operators are available:

### [in] Operator - Match Any Value

Finds documents where the array field contains ANY of the specified values.

```
# Players who play either PowerForward OR Center
GET /api/players?position[in]=PowerForward,Center

# Articles with specific keywords
GET /api/articles?metaKeywords[in]=strategy,analysis
```

### [all] Operator - Match All Values

Finds documents where the array field contains ALL of the specified values.

```
# Players who play BOTH PowerForward AND Center
GET /api/players?position[all]=PowerForward,Center

# Articles with all specified keywords
GET /api/articles?metaKeywords[all]=basketball,strategy
```

## Combining Multiple Filters

You can combine multiple filters in a single query:

```
# Players who:
# - Are Centers or PowerForwards
# - Born after 1995
# - Weight greater than 220 lbs
GET /api/players?position[in]=Center,PowerForward&bornYear[gt]=1995&weight[gt]=220

# Matches that:
# - Were played at home
# - We scored more than 100 points
# - We won
GET /api/matches?location=Home&ourScore[gt]=100&result=Win
```

## Model-Specific Examples

### Players

```
# Guards over 6'3"
GET /api/players?position[in]=PointGuard,ShootingGuard&height[gt]=6'3"

# Young centers
GET /api/players?position=Center&bornYear[gte]=2000

# Multi-position players
GET /api/players?position[all]=PointGuard,ShootingGuard
```

### Player Stats

```
# High scoring performances
GET /api/player-stats?totalPoints[gte]=20

# Double-doubles (points and rebounds)
GET /api/player-stats?totalPoints[gte]=10&totalRebounds[gte]=10

# Efficient shooting games
GET /api/player-stats?fieldGoalsMade[gte]=5&fieldGoalsAttempted[lte]=10
```

### Matches

```
# Home wins
GET /api/matches?location=Home&result=Win

# High-scoring games
GET /api/matches?ourScore[gt]=100

# Recent matches
GET /api/matches?date[gt]=2024-01-01
```

### Articles

```
# Articles by specific author
GET /api/articles?author=Coach Williams

# Recent articles
GET /api/articles?createdAt[gt]=2024-01-01

# Articles with specific keywords
GET /api/articles?metaKeywords[in]=strategy,analysis
```

## Notes

1. All date fields should be provided in ISO format (YYYY-MM-DD)
2. String comparisons are case-sensitive
3. Numeric ranges can be combined (e.g., `field[gte]=10&field[lte]=20`)
4. Array operators can accept multiple values separated by commas
5. The API will return a 200 status code with an empty data array if no matches are found
