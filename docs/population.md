# API Population Documentation

The API supports optional population of related data fields. This allows you to retrieve related data in a single request without having to make additional requests.

## Basic Usage

To populate a related field, use the `populate` query parameter:

```
GET /api/player-stats?populate=player
```

This will return player stats with the player data included in each record.

Population also works when retrieving a single resource:

```
GET /api/players/60d21b4667d0d8992e610c80?populate=statsHistory
```

This will return a single player with their stats history populated.

## Multiple Field Population

You can populate multiple fields by providing a comma-separated list:

```
GET /api/player-stats?populate=player,match
```

This will populate both the player and match fields in the player stats.

## Selective Field Population

You can specify which fields to include from the populated document by using the colon syntax:

```
GET /api/player-stats?populate=player:name,number,position
```

This will only include the name, number, and position fields from the player document.

For multiple fields with selective population, separate the field specifications with commas:

```
GET /api/player-stats?populate=player:name,number;match:opponent,date
```

This will populate the player field with only name and number, and the match field with only opponent and date.

## Combining with Other Features

Population can be combined with filtering, sorting, and pagination:

```
GET /api/player-stats?points[gte]=20&sort=-efficiency&page=2&limit=5&populate=player,match
```

## Available Relations

### PlayerStats Model

- `player`: References a Player document
- `match`: References a Match document

### Player Model

- `statsHistory`: References PlayerStats documents

### Match Model

- `playerStats`: References PlayerStats documents

### MatchPdfUpload Model

- `uploadedBy`: References a User document
- `matchId`: References a Match document

## Response Format

When using population, the referenced fields in the response will be replaced with the actual documents from the referenced collections:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "points": 25,
      "assists": 8,
      "player": {
        "_id": "60d21b4667d0d8992e610c80",
        "name": "John Doe",
        "number": 23,
        "position": ["PointGuard"]
      },
      "match": {
        "_id": "60d21b4667d0d8992e610c82",
        "opponent": "Team A",
        "date": "2023-05-15T18:30:00.000Z"
      }
    }
  ]
}
```

## Performance Considerations

1. Populate only when necessary, as it may increase response time for large datasets
2. When populating multiple fields or deep nesting, consider using selective field population to limit the data returned
3. For very large collections, it may be more efficient to make separate requests rather than using population
