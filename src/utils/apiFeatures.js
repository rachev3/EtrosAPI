/**
 * APIFeatures class provides advanced query functionality for MongoDB
 *
 * This class implements various API features including:
 * - Filtering with comparison operators
 * - Array field filtering with $in and $all operators
 * - Support for multiple conditions on the same field
 *
 * @example
 * // Basic usage
 * const features = new APIFeatures(Model.find(), req.query);
 * const results = await features.filter().query;
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
}

export default APIFeatures;
