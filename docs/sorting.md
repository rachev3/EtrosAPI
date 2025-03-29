# API Sorting Documentation

The API supports flexible sorting capabilities across all resources. This document explains how to use sorting parameters and provides examples for different models.

## Basic Sorting

To sort results by a single field, use the `sort` parameter with the field name:

```
GET /api/players?sort=name
```

This will sort the players by name in ascending (A-Z) order.

## Descending Order

To sort in descending order, prefix the field name with a minus sign (`-`):

```
GET /api/players?sort=-height
```

This will sort players by height in descending order (tallest first).

## Multiple Field Sorting

You can sort by multiple fields by providing a comma-separated list:

```
GET /api/player-stats?sort=-totalPoints,assists
```

This will sort player stats by total points in descending order (highest first), and then by assists in ascending order for players with the same points.

## Default Sorting

If no sort parameter is specified, resources will be sorted by `createdAt` in descending order (newest first).

## Model-Specific Examples

### Players

```
# Sort by name (A-Z)
GET /api/players?sort=name

# Sort by age (youngest first)
GET /api/players?sort=-bornYear

# Sort by position, then by height
GET /api/players?sort=position,-height

# Sort players by number
GET /api/players?sort=number
```

### Player Stats

```
# Sort by points (highest first)
GET /api/player-stats?sort=-totalPoints

# Sort by efficiency rating
GET /api/player-stats?sort=-efficiency

# Sort by rebounds, then assists
GET /api/player-stats?sort=-totalRebounds,-assists

# Double sort by field goal percentage (calculated fields not directly supported)
GET /api/player-stats?sort=-fieldGoalsMade,-fieldGoalsAttempted
```

### Matches

```
# Sort by date (newest first)
GET /api/matches?sort=-date

# Sort by our score (highest first)
GET /api/matches?sort=-ourScore

# Sort by location, then date
GET /api/matches?sort=location,-date
```

### Articles

```
# Sort by title alphabetically
GET /api/articles?sort=title

# Sort by publication date (newest first)
GET /api/articles?sort=-createdAt

# Sort by author, then by date
GET /api/articles?sort=author,-createdAt
```

## Combining with Filtering

Sorting can be combined with filtering to create powerful queries:

```
# Players who are Centers, sorted by height
GET /api/players?position=Center&sort=-height

# High-scoring performances, sorted by efficiency
GET /api/player-stats?totalPoints[gte]=20&sort=-efficiency,-totalPoints

# Home wins, sorted by date
GET /api/matches?location=Home&result=Win&sort=-date
```

## Notes

1. Sort parameter accepts comma-separated field names for multiple sort fields.
2. Prefix a field with `-` for descending order.
3. Fields that don't exist in the model will be ignored.
4. Sorting is case-sensitive for string fields.
5. Performance impact of sorting is minimal for most queries.
6. The default sort order is by creation date (newest first).
