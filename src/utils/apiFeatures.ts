import { Query } from "mongoose";

/**
 * Interface for pagination data
 */
interface PaginationData {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

/**
 * Interface for query parameters
 */
interface QueryParams {
  [key: string]: any;
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  populate?: string;
}

class APIFeatures<T> {
  public query: Query<T[], T>;
  public queryString: QueryParams;
  public totalCount: number;
  public paginationData?: PaginationData;

  constructor(query: Query<T[], T>, queryString: QueryParams) {
    this.query = query;
    this.queryString = queryString;
    this.totalCount = 0;
  }

  filter(): APIFeatures<T> {
    const queryObj = { ...this.queryString };

    // Fields to exclude from filtering
    const excludedFields = ["page", "sort", "limit", "fields", "populate"];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Handle special cases for array fields
    Object.keys(queryObj).forEach((key) => {
      if (queryObj[key] && typeof queryObj[key] === "object") {
        // Handle in operator (any of the values)
        if (queryObj[key].in) {
          if (typeof queryObj[key].in === "string") {
            queryObj[key].in = queryObj[key].in.split(",");
          }
        }
        // Handle all operator (must have all values)
        if (queryObj[key].all) {
          if (typeof queryObj[key].all === "string") {
            queryObj[key].all = queryObj[key].all.split(",");
          }
        }
      }
    });

    // Advanced filtering for gt, gte, lt, lte, in, all
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in|all)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort(): APIFeatures<T> {
    if (this.queryString.sort) {
      // Handle comma-separated sort fields
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      // Default sort by createdAt descending if not specified
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  async paginate(): Promise<APIFeatures<T>> {
    // Convert page and limit to numbers with defaults
    // Default page is 1, default limit is Number.MAX_SAFE_INTEGER (effectively no limit)
    const page = parseInt(this.queryString.page || "1", 10);
    const limit = this.queryString.limit
      ? parseInt(this.queryString.limit, 10)
      : Number.MAX_SAFE_INTEGER;
    const skip = (page - 1) * limit;

    // Calculate total documents for pagination metadata
    // We need to clone the query to get the count without pagination
    const countQuery = this.query.model.find(this.query.getFilter());
    this.totalCount = await countQuery.countDocuments();

    // Apply pagination to the original query
    this.query = this.query.skip(skip).limit(limit);

    // Add pagination metadata
    this.paginationData = {
      page,
      limit: limit === Number.MAX_SAFE_INTEGER ? this.totalCount : limit,
      totalPages:
        limit === Number.MAX_SAFE_INTEGER
          ? 1
          : Math.ceil(this.totalCount / limit),
      totalResults: this.totalCount,
    };

    return this;
  }

  populate(): APIFeatures<T> {
    if (this.queryString.populate) {
      // If populate param exists, parse it
      const populateFields = this.queryString.populate.split(",");

      // Process each field to populate
      populateFields.forEach((field) => {
        // Case 1: Field with selection specified (field:selection)
        if (field.includes(":")) {
          const [fieldName, selection] = field.split(":");

          // For special case handling of playerStats:player
          if (fieldName === "playerStats" && selection.includes("player")) {
            // Handle nested population for playerStats -> player
            this.query = this.query.populate({
              path: "playerStats",
              populate: { path: "player" },
            });
          } else {
            // Convert selection to space-separated string for mongoose
            const select = selection.replace(/;/g, " ");
            this.query = this.query.populate({
              path: fieldName,
              select,
            });
          }
        } else if (field.includes(".")) {
          const parts = field.split(".");

          if (parts.length === 2) {
            this.query = this.query.populate({
              path: parts[0],
              populate: { path: parts[1] },
            });
          } else if (parts.length === 3) {
            this.query = this.query.populate({
              path: parts[0],
              populate: {
                path: parts[1],
                populate: { path: parts[2] },
              },
            });
          } else {
            this.query = this.query.populate({
              path: parts[0],
              populate: { path: parts[1] },
            });
          }
        } else {
          this.query = this.query.populate(field);
        }
      });
    }

    return this;
  }
}

export default APIFeatures;
