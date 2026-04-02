const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, index: true, trim: true },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: { type: String, enum: ['scheduled', 'cancelled'], default: 'scheduled' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

scheduleSchema.index({ employeeId: 1, date: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
