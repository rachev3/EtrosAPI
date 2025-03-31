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

## Nested Population

You can populate nested references using dot notation. This allows you to populate fields within populated documents:

```
GET /api/matches?populate=playerStats.player
```

This will populate the playerStats array and also populate the player reference within each playerStat.

You can populate multiple nested fields:

```
GET /api/matches?populate=playerStats.player,playerStats.match
```

This will populate both the player and match references within each playerStat.

You can also populate deeper nested relationships:

```
GET /api/matches?populate=playerStats.player.team
```

This will populate playerStats, then populate the player within each playerStat, and finally populate the team within each player.

## Combining Population Features

You can combine different population features in the same request:

```
GET /api/matches?populate=playerStats.player,teamStats:points,assists
```

This will:

- Populate playerStats and their nested player references
- Populate teamStats but only include points and assists fields

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
4. Deep nested population (more than 2 levels) should be used sparingly as it can significantly impact performance
5. Consider the following alternatives for better performance:
   - Use multiple targeted requests instead of deep nesting
   - Create denormalized fields for frequently accessed data
   - Implement caching for commonly requested nested data

## Best Practices

1. Always specify only the fields you need when using population
2. Use dot notation for nested population only when necessary
3. Keep population depth to a minimum (preferably no more than 2 levels)
4. Consider implementing field filtering alongside population to reduce response size
5. Use pagination when populating arrays of references to limit the amount of data returned
