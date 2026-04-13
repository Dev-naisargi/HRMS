const Company = require("../models/Company");
const User = require("../models/User");

// 1. GET ALL COMPANIES (with pagination, search, filter, sort)
exports.getAllCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, plan, sort = "-createdAt" } = req.query;

    const query = {};

    // ✅ FIX: Support old + new data
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } }, // 🔥 IMPORTANT
        { domain: { $regex: search, $options: "i" } },
        { adminEmail: { $regex: search, $options: "i" } }
      ];
    }

    if (status) query.status = status.toUpperCase();

    if (plan) query["subscription.plan"] = plan.toUpperCase();

    const companies = await Company.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Company.countDocuments(query);

    // ✅ FIX: Normalize response
    const formattedCompanies = companies.map(c => ({
      ...c._doc,
      name: c.name || c.companyName // 🔥 unify field
    }));

    res.json({
      companies: formattedCompanies,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalCompanies: count
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching companies", error: error.message });
  }
};

// 2. GET SINGLE COMPANY DETAILS
exports.getCompanyDetails = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    // Fetch stats for this company
    const totalEmployees = await User.countDocuments({ companyId: company._id, role: "EMPLOYEE" });
    const totalHRs = await User.countDocuments({ companyId: company._id, role: "HR" });

    res.json({
      company,
      stats: {
        totalEmployees,
        totalHRs
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching company details", error: error.message });
  }
};

// 3. APPROVE COMPANY
exports.approveCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { 
        status: "APPROVED",
        "subscription.isActive": true,
        "subscription.startDate": new Date(),
        // Default 1 year subscription for newly approved
        "subscription.endDate": new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      },
      { new: true }
    );

    res.json({ message: "Company approved", company });
  } catch (error) {
    res.status(500).json({ message: "Error approving company" });
  }
};

// 4. REJECT COMPANY
exports.rejectCompany = async (req, res) => {
  try {
    const { reason } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status: "REJECTED", rejectionReason: reason },
      { new: true }
    );

    res.json({ message: "Company rejected", company });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting company" });
  }
};

// 5. UPDATE COMPANY
exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json({ message: "Company updated", company });
  } catch (error) {
    res.status(500).json({ message: "Error updating company" });
  }
};

// 6. DELETE COMPANY
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    
    // Cleanup users associated with the company
    await User.deleteMany({ companyId: company._id });

    res.json({ message: "Company and all associated users deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting company" });
  }
};

// 7. SUSPEND / ACTIVATE
exports.updateCompanyStatus = async (req, res) => {
  try {
    const { status } = req.body; // SUSPENDED or APPROVED
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status: status.toUpperCase() },
      { new: true }
    );

    res.json({ message: `Company status updated to ${status}`, company });
  } catch (error) {
    res.status(500).json({ message: "Error updating company status" });
  }
};

// 8. MANAGE SUBSCRIPTION
exports.manageSubscription = async (req, res) => {
  try {
    const { plan, endDate, isActive } = req.body;
    const updateData = {};
    if (plan) updateData["subscription.plan"] = plan.toUpperCase();
    if (endDate) updateData["subscription.endDate"] = new Date(endDate);
    if (isActive !== undefined) updateData["subscription.isActive"] = isActive;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.json({ message: "Subscription updated", company });
  } catch (error) {
    res.status(500).json({ message: "Error updating subscription" });
  }
};

// 9. DASHBOARD STATS
exports.getSystemStats = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const activeCompanies = await Company.countDocuments({ status: "APPROVED" });
    const pendingCompanies = await Company.countDocuments({ status: "PENDING" });
    
    const totalHRs = await User.countDocuments({ role: "HR" });
    const totalEmployees = await User.countDocuments({ role: "EMPLOYEE" });

    // Aggregate Plan Distribution
    const planDistribution = await Company.aggregate([
      { $group: { _id: "$subscription.plan", count: { $sum: 1 } } }
    ]);
    const planColors = { "BASIC": "#10B981", "PREMIUM": "#3B82F6", "ENTERPRISE": "#8B5CF6" };
    const planData = [
      { name: "Basic", count: 0, fill: "#10B981" },
      { name: "Premium", count: 0, fill: "#3B82F6" },
      { name: "Enterprise", count: 0, fill: "#8B5CF6" },
      { name: "Trial", count: 0, fill: "#9CA3AF" } // fallback
    ];
    planDistribution.forEach(p => {
       const planName = p._id ? p._id.charAt(0) + p._id.slice(1).toLowerCase() : 'Unknown';
       let target = planData.find(x => x.name.toLowerCase() === planName.toLowerCase());
       if (target) { target.count = p.count; } 
       else { planData.push({ name: planName, count: p.count, fill: planColors[p._id] || "#9CA3AF" }); }
    });

    // Aggregate Growth Data (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0,0,0,0);

    const companiesByMonth = await Company.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          companies: { $sum: 1 }
      }}
    ]);

    const employeesByMonth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, role: "EMPLOYEE" } },
      { $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          employees: { $sum: 1 }
      }}
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const growthData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      
      const cData = companiesByMonth.find(c => c._id.year === y && c._id.month === m);
      const eData = employeesByMonth.find(e => e._id.year === y && e._id.month === m);

      growthData.push({
        name: monthNames[m - 1],
        companies: cData ? cData.companies : 0,
        employees: eData ? eData.employees : 0
      });
    }

    res.json({
      totalCompanies,
      activeCompanies,
      pendingCompanies,
      totalHRs,
      totalEmployees,
      growthData,
      planData: planData.filter(p => p.count > 0) // only send plans with > 0 
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching system stats", error: String(error) });
  }
};

// 10. GET ALL HRs
exports.getAllHRs = async (req, res) => {
  try {
    const hrs = await User.find({ role: "HR" }).populate("companyId", "name").select("-password");
    res.json(hrs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching HRs" });
  }
};

// 11. GET ALL EMPLOYEES
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "EMPLOYEE" }).populate("companyId", "name").select("-password");
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees" });
  }
};

// 12. REPORTS (Stubs)
exports.getReports = async (req, res) => res.json([]);
exports.generateReport = async (req, res) => res.json({ message: "Not implemented" });
exports.deleteReport = async (req, res) => res.json({ message: "Not implemented" });
