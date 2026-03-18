const Leave = require("../models/Leave");

/* Apply Leave (Employee)*/

const applyLeave = async (req, res) => {
  try {

    const { type, from, to, reason } = req.body;

    if (!type || !from || !to || !reason) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const startDate = new Date(from);
    const endDate = new Date(to);

    if (startDate > endDate) {
      return res.status(400).json({
        message: "Invalid leave dates"
      });
    }

    /*  Check overlapping leave  */

    const overlap = await Leave.findOne({
      employee: req.user.userId,
      status: { $in: ["Pending", "Approved"] },
      $or: [
        { from: { $lte: endDate }, to: { $gte: startDate } }
      ]
    });

    if (overlap) {
      return res.status(400).json({
        message: "Leave dates overlap with existing leave"
      });
    }

    /*  Calculate total leave days  */

    const totalDays =
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    /*  Create leave */

    const leave = await Leave.create({
      employee: req.user.userId,
      company: req.user.companyId,
      type,
      from: startDate,
      to: endDate,
      reason,
      totalDays,
      status: "Pending"
    });

    res.status(201).json({
      message: "Leave applied successfully",
      leave
    });

  } catch (error) {
    console.error("Apply Leave Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



/*Get My Leaves (Employee)*/

const getMyLeaves = async (req, res) => {
  try {

    const leaves = await Leave.find({
      employee: req.user.userId
    }).sort({ createdAt: -1 });

    res.json(leaves);

  } catch (error) {
    console.error("Get My Leaves Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



/*Get Company Leaves (HR/Admin)*/

const getCompanyLeaves = async (req, res) => {
  try {

    const leaves = await Leave.find({
      company: req.user.companyId
    })
      .populate("employee", "name email department")
      .sort({ createdAt: -1 });

    res.json(leaves);

  } catch (error) {
    console.error("Get Company Leaves Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



/* Update Leave Status (HR/Admin)*/

const updateLeaveStatus = async (req, res) => {
  try {

    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        message: "Leave not found"
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        message: "Leave already processed"
      });
    }

    leave.status = status;

    await leave.save();

    res.json({
      message: `Leave ${status.toLowerCase()} successfully`,
      leave
    });

  } catch (error) {
    console.error("Update Leave Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



/*Cancel Leave (Employee)*/

const cancelLeave = async (req, res) => {
  try {

    const leave = await Leave.findOne({
      _id: req.params.id,
      employee: req.user.userId
    });

    if (!leave) {
      return res.status(404).json({
        message: "Leave not found"
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        message: "Cannot cancel approved or rejected leave"
      });
    }

    /* Prevent cancelling past leave */

    if (new Date(leave.from) <= new Date()) {
      return res.status(400).json({
        message: "Cannot cancel leave that already started"
      });
    }

    await leave.deleteOne();

    res.json({
      message: "Leave cancelled successfully"
    });

  } catch (error) {
    console.error("Cancel Leave Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
  applyLeave,
  getMyLeaves,
  getCompanyLeaves,
  updateLeaveStatus,
  cancelLeave
};