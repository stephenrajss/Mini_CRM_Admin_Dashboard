import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';

export function validateObjectId(param = 'id') {
  return (req, _res, next) => {
    if (!mongoose.isValidObjectId(req.params[param])) {
      next(new ApiError(400, 'Invalid id'));
      return;
    }
    next();
  };
}
