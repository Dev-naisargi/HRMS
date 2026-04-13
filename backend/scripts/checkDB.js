const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/Project-HRMS').then(async () => {
  const companies = await mongoose.connection.collection('companies').find({}).toArray();
  const users = await mongoose.connection.collection('users').find({}).project({ name:1, email:1, role:1, companyId:1 }).toArray();
  
  console.log('\n=== COMPANIES ===');
  companies.forEach(c => {
    console.log(`ID: ${c._id} | Name: ${c.name} | Admin: ${c.adminEmail} | Status: ${c.status} | SubActive: ${c.subscription?.isActive}`);
  });
  
  console.log('\n=== USERS ===');
  users.forEach(u => {
    console.log(`${u.role?.padEnd(12)} | ${u.email?.padEnd(35)} | CompanyId: ${u.companyId}`);
  });
  
  process.exit();
});
