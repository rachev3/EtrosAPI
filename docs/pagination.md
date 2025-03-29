# API Pagination Documentation

The API supports pagination to manage large result sets. By default, all items are returned on a single page. You can optionally use pagination parameters to split the results into smaller chunks.

## Basic Usage

Default behavior (returns all items):

```
GET /api/players
```

To paginate results, use the `page` and `limit` parameters:

```
GET /api/players?page=1&limit=10
```

This will return the first 10 players (page 1 with a limit of 10 items per page).

## Page Parameters

- `page`: The page number to retrieve (starting from 1)
- `limit`: The number of items per page

## Default Values

If not specified, the API uses these default values:

- Default page: 1
- Default behavior: Returns all items on a single page
- When limit is specified: Uses the provided limit value

## Response Format

The API response includes a `pagination` object with metadata:

```json
{
  "success": true,
  "count": 47,
  "pagination": {
    "page": 1,
    "limit": 47,
    "totalPages": 1,
    "totalResults": 47
  },
  "data": [...]
}
```

## Pagination Metadata

The pagination object contains:

- `page`: Current page number
- `limit`: Number of items per page (equals total results when no limit specified)
- `totalPages`: Total number of pages (1 when no limit specified)
- `totalResults`: Total number of items across all pages

## Examples

### Default Behavior (All Items)

```
# Get all items in one page
GET /api/players
```

### Using Pagination

```
# Get first 10 items
GET /api/players?limit=10

# Get second page with 10 items
GET /api/players?page=2&limit=10

# Get first 5 items
GET /api/players?limit=5
```

### Combining with Other Features

Pagination can be combined with filtering and sorting:

```
# Get all Center players, sorted by height
GET /api/players?position=Center&sort=-height

# Get first 10 Center players, sorted by height
GET /api/players?position=Center&sort=-height&limit=10

# Get second page of high-scoring performances, 5 per page
GET /api/player-stats?points[gte]=20&sort=-efficiency&page=2&limit=5
```

## Notes

1. By default, the API returns all items on a single page for simplicity
2. When a limit is specified, the response is paginated according to that limit
3. When requesting a page beyond the available data, the API returns an empty data array with appropriate pagination metadata
4. For very large datasets, it's recommended to use pagination with a reasonable limit (e.g., 10-100 items per page) for better performance
5. The `count` field in the response shows the actual number of items returned on the current page
6. Pagination counts are based on the filtered dataset, not the total collection size
