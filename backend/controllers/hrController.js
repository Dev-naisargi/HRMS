const User = require("../models/User");

// HR Dashboard
const getHRDashboard = async (req, res) => {
  try {
    const hr = await User.findById(req.user.userId).select("-password");

    if (!hr) {
      return res.status(404).json({ message: "HR not found" });
    }

    res.status(200).json({
      message: "Welcome HR",
      hr,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getHRDashboard };