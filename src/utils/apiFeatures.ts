import { Query } from "mongoose";

interface PaginationData {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

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

    const excludedFields = ["page", "sort", "limit", "fields", "populate"];
    excludedFields.forEach((field) => delete queryObj[field]);

    Object.keys(queryObj).forEach((key) => {
      if (queryObj[key] && typeof queryObj[key] === "object") {
        if (queryObj[key].in) {
          if (typeof queryObj[key].in === "string") {
            queryObj[key].in = queryObj[key].in.split(",");
          }
        }
        if (queryObj[key].all) {
          if (typeof queryObj[key].all === "string") {
            queryObj[key].all = queryObj[key].all.split(",");
          }
        }
      }
    });

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
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  async paginate(): Promise<APIFeatures<T>> {
    const page = parseInt(this.queryString.page || "1", 10);
    const limit = this.queryString.limit
      ? parseInt(this.queryString.limit, 10)
      : Number.MAX_SAFE_INTEGER;
    const skip = (page - 1) * limit;

    const countQuery = this.query.model.find(this.query.getFilter());
    this.totalCount = await countQuery.countDocuments();

    this.query = this.query.skip(skip).limit(limit);

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
      const populateFields = this.queryString.populate.split(",");

      populateFields.forEach((field) => {
        if (field.includes(":")) {
          const [fieldName, selection] = field.split(":");

          if (fieldName === "playerStats" && selection.includes("player")) {
            this.query = this.query.populate({
              path: "playerStats",
              populate: { path: "player" },
            });
          } else {
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
