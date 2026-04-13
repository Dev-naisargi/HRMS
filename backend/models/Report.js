const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    companyTarget: {
        type: String,
        default: "All Companies",
    },
    type: {
        type: String,
        enum: ["Attendance", "Payroll", "HR", "Employees", "System"],
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Completed",
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    date: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

module.exports = mongoose.model("Report", reportSchema);
