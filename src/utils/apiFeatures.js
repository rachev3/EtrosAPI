/**
 * APIFeatures class provides advanced query functionality for MongoDB
 *
 * This class implements various API features including:
 * - Filtering with comparison operators
 * - Array field filtering with $in and $all operators
 * - Support for multiple conditions on the same field
 * - Sorting by single or multiple fields
 * - Pagination with page and limit parameters (defaults to all items on page 1)
 *
 * @example
 * // Basic usage
 * const features = new APIFeatures(Model.find(), req.query);
 * const results = await features.filter().sort().paginate().query;
 */
class APIFeatures {
  /**
   * Creates an instance of APIFeatures
   * @param {mongoose.Query} query - Mongoose query object
   * @param {Object} queryString - Query parameters from request
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.totalCount = 0;
  }

  /**
   * Applies filters to the query based on URL parameters
   *
   * Supported operators:
   * - Comparison: [gt], [gte], [lt], [lte]
   * - Array: [in], [all]
   *
   * @example
   * // Greater than
   * /api/resource?field[gt]=value
   *
   * // Less than or equal
   * /api/resource?field[lte]=value
   *
   * // Multiple conditions
   * /api/resource?field1[gte]=value1&field2[lt]=value2
   *
   * // Array contains any (in)
   * /api/resource?field[in]=value1,value2
   *
   * // Array contains all
   * /api/resource?field[all]=value1,value2
   *
   * @returns {APIFeatures} Returns this for method chaining
   */
  filter() {
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

  /**
   * Sorts the results based on the sort parameter
   *
   * @example
   * // Sort by name in ascending order
   * /api/resource?sort=name
   *
   * // Sort by name in descending order
   * /api/resource?sort=-name
   *
   * // Sort by multiple fields (name ascending, age descending)
   * /api/resource?sort=name,-age
   *
   * @returns {APIFeatures} Returns this for method chaining
   */
  sort() {
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

  /**
   * Adds pagination to the query using page and limit parameters
   * By default, returns all items on page 1 if no limit is specified
   *
   * @example
   * // Get all items (default behavior)
   * /api/resource
   *
   * // Get specific page with custom limit
   * /api/resource?page=2&limit=10
   *
   * @returns {APIFeatures} Returns this for method chaining
   */
  async paginate() {
    // Convert page and limit to numbers with defaults
    // Default page is 1, default limit is Number.MAX_SAFE_INTEGER (effectively no limit)
    const page = parseInt(this.queryString.page, 10) || 1;
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
}

export default APIFeatures;
