const Leave = require("../models/Leave");

const applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, type, reason } = req.body;
    const duration = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
    
    const leave = await Leave.create({
      employeeId: req.user.id,
      companyId: req.user.companyId,
      startDate,
      endDate,
      type,
      reason,
      duration,
      adminApproval: duration > 5 ? 'PENDING' : 'NA'
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLeaves = async (req, res) => {
  try {
    const query = { companyId: req.user.companyId };
    if (req.user.role === "EMPLOYEE") {
      query.employeeId = req.user.id;
    }
    const leaves = await Leave.find(query).populate("employeeId", "name email");
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveLeaveHR = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED
    const leave = await Leave.findOne({ _id: id, companyId: req.user.companyId });
    
    if (!leave) return res.status(404).json({ message: "Leave not found" });
    
    leave.hrApproval = status;
    
    if (leave.duration <= 5) {
      leave.status = status;
    } else if (status === "REJECTED") {
      leave.status = "REJECTED";
    }
    
    await leave.save();

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveLeaveAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const leave = await Leave.findOne({ _id: id, companyId: req.user.companyId });
    
    if (!leave) return res.status(404).json({ message: "Leave not found" });
    if (leave.hrApproval !== "APPROVED") return res.status(400).json({ message: "HR approval required first" });
    
    leave.adminApproval = status;
    leave.status = status;
    
    await leave.save();

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    // ✅ Only owner can delete
    if (leave.employeeId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ Only pending can be deleted (important)
    if (leave.status !== "PENDING") {
      return res.status(400).json({
        message: "Only pending leave can be deleted",
      });
    }

    await leave.deleteOne();

    res.json({ message: "Leave deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = { applyLeave, getLeaves, approveLeaveHR, approveLeaveAdmin, deleteLeave };
