const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },

    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"]
    },
designation: {
  type: String,
  default: ""
},
    password: { 
      type: String, 
      required: true 
    },

    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "HR", "EMPLOYEE"],
      default: "EMPLOYEE",
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: function () {
        return this.role !== "SUPER_ADMIN";
      },
    },

    status: { 
      type: String, 
      enum: ["ACTIVE", "INACTIVE"], 
      default: "ACTIVE" 
    },

    // ✅ PERSONAL
    dob: { type: Date },
    doj: { type: Date },
    phone: { 
      type: String,
      match: [/^[0-9]{10}$/, "Phone must be 10 digits"]
    },

    // ✅ KEEP DEPARTMENT (but controlled)
    department: {
      type: String,
      required: function () {
        return this.role === "HR" || this.role === "EMPLOYEE";
      }
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);