import { ApiError } from '../utils/ApiError.js';

export function validate(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse({
      body: req.body ?? {},
      query: req.query ?? {},
      params: req.params ?? {},
    });

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => {
        const path = issue.path.filter((part, index) => {
          if (index === 0 && (part === 'body' || part === 'query' || part === 'params')) return false;
          return true;
        });
        return {
          field: path.join('.') || 'request',
          message: issue.message,
        };
      });
      next(new ApiError(422, 'Validation failed', errors));
      return;
    }

    req.validated = parsed.data;
    next();
  };
}
