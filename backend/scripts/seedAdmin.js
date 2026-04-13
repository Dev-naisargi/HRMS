const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/Project-HRMS').then(async () => {
  const company = await mongoose.connection.collection('companies').findOne({ name: 'Legacy Company Found' });
  if (!company) {
    console.log("No legacy company found to attach to!");
    process.exit();
  }
  
  // ensure it is approved so the admin can log in without 403
  await mongoose.connection.collection('companies').updateOne({ _id: company._id }, { $set: { status: 'APPROVED' } });

  const hash = await bcrypt.hash('password123', 10);
  
  // Clean up if it already exists partially
  await mongoose.connection.collection('users').deleteOne({ email: "admin@company.com" });

  await mongoose.connection.collection('users').insertOne({
    name: "Seeded Admin",
    email: "admin@company.com",
    password: hash,
    role: "ADMIN",
    companyId: company._id,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  console.log("SUCCESS: admin@company.com created");
  process.exit();
});
