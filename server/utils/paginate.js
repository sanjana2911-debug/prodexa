/**
 * Pagination helper for consistent API pagination responses
 */

/**
 * Get pagination parameters from request query
 */
const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build paginated response object
 */
const buildPaginatedResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    success: true,
    count: data.length,
    total,
    totalPages,
    currentPage: page,
    data,
    pagination: {
      hasNext: page < totalPages,
      hasPrev: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    },
  };
};

module.exports = { getPaginationParams, buildPaginatedResponse };