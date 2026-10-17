import mongoose from 'mongoose';
import { USER_ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
    passwordHash: { type: String, required: true, select: false },
    token: { type: [String], default: [], select: false },
    role: { type: String, enum: USER_ROLES, default: 'user', index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.token;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
