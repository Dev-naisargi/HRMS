const mongoose = require("mongoose");

const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    
    .then(() => {
  console.log("MongoDB connected");
  console.log("Database name:", mongoose.connection.name);
})

    .catch((err) => {
      console.error("MongoDB connection failed:", err.message);
    });
};

module.exports = connectDB;
