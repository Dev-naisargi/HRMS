const mongoose = require("mongoose");
const Company = require("./models/Company");
require("dotenv").config();

async function approveAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await Company.updateMany({}, { $set: { status: "Approved" } });
        console.log(`Approved ${result.modifiedCount} companies.`);
        mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
approveAll();
