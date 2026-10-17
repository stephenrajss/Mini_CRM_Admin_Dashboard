import mongoose from 'mongoose';
import { LEAD_STATUSES } from '../config/constants.js';

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    status: { type: String, enum: LEAD_STATUSES, default: 'new' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
    notes: { type: String, trim: true, maxlength: 2000, default: '' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

leadSchema.pre('validate', function normalizeEmail() {
  if (typeof this.email === 'string') {
    this.email = this.email.trim().toLowerCase();
  }
});

leadSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
leadSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
leadSchema.index({ isDeleted: 1, assignedTo: 1 });
leadSchema.index({ isDeleted: 1, company: 1 });
leadSchema.index({ name: 1 });
leadSchema.index({ phone: 1 });

export const Lead = mongoose.model('Lead', leadSchema);
