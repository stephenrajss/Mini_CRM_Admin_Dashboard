import mongoose from 'mongoose';
import { TASK_STATUSES } from '../config/constants.js';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: TASK_STATUSES, default: 'pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

taskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });
taskSchema.index({ lead: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1, dueDate: 1 });

export const Task = mongoose.model('Task', taskSchema);
