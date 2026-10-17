import mongoose from 'mongoose';
import { normalizeName } from '../utils/names.js';

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    nameNormalized: { type: String, required: true, unique: true },
    industry: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
    location: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    website: { type: String, trim: true, maxlength: 200, default: '' },
    phone: { type: String, trim: true, maxlength: 30, default: '' },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

companySchema.pre('validate', function setNormalizedName() {
  if (typeof this.name === 'string') {
    this.nameNormalized = normalizeName(this.name);
  }
});
companySchema.index({ name: 1 });

export const Company = mongoose.model('Company', companySchema);
