const Hr = require("../models/Hr");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


async function signupHR(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }
    const existingHr = await Hr.findOne({ email });
    if (existingHr) {
      return res.status(409).json({
        message: "HR already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const hr = await Hr.create({
      name,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      message: "HR account created successfully",
      hrId: hr._id
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error"
    });
  }
}
const loginHR = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hr = await Hr.findOne({ email });
    if (!hr) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, hr.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: hr._id, role: hr.role , email:hr.email },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );
 res.json({
      token,
      role: hr.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signupHR, loginHR };