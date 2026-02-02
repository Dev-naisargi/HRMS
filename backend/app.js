require("dotenv").config();
const express = require("express");
const cors = require('cors');
const { connectDB } = require("./config/connection");
const HrRoutes = require("./routes/Hr");



const app = express();
const PORT = 5000;


connectDB("mongodb://127.0.0.1:27017/HRMS");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/hr", HrRoutes);


app.get("/", (req, res) => {
  res.send("Welcome");
});

app.listen(PORT, () =>
  console.log(`Server is running at PORT:${PORT}`)
);
