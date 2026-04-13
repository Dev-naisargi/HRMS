const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    startDate: Date,
    endDate: Date,
    type: { type: String, enum: ['SICK', 'CASUAL', 'PAID'] },
    reason: String,
    duration: Number,
    hrApproval: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    adminApproval: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'NA'], default: 'PENDING' },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);