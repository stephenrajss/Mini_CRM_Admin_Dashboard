export function buildSort(sortBy, sortOrder) {
  return { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
}

export function buildPagination(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

export function skipFor(page, limit) {
  return (page - 1) * limit;
}
