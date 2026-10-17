export function sendSuccess(res, { status = 200, message, data = null, pagination }) {
  const body = { success: true, message, data };
  if (pagination) {
    body.pagination = pagination;
  }
  return res.status(status).json(body);
}
