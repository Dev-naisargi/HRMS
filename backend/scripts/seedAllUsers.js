const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/Project-HRMS').then(async () => {
  // Get ALL companies
  const companies = await mongoose.connection.collection('companies').find({}).toArray();
  
  if (companies.length === 0) {
    console.log("No companies found!");
    return process.exit();
  }

  console.log('\nExisting companies:');
  companies.forEach((c, i) => console.log(`  [${i}] ${c._id} → ${c.name} | admin: ${c.adminEmail}`));

  const hash = await bcrypt.hash('password123', 10);

  for (const company of companies) {
    // Ensure company is approved and subscription active
    await mongoose.connection.collection('companies').updateOne(
      { _id: company._id },
      { $set: {
        status: 'APPROVED',
        'subscription.isActive': true,
        'subscription.plan': 'BASIC',
        'subscription.startDate': new Date(),
        'subscription.endDate': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }}
    );

    const tag = company.name?.replace(/\s+/g, '').toLowerCase().slice(0, 8) || 'co';
    const hrEmail = `hr@${tag}.com`;
    const empEmail = `emp@${tag}.com`;

    // Upsert HR
    await mongoose.connection.collection('users').deleteOne({ email: hrEmail });
    await mongoose.connection.collection('users').insertOne({
      name: `HR Manager (${company.name})`,
      email: hrEmail,
      password: hash,
      role: 'HR',
      companyId: company._id,
      department: 'Human Resources',
      status: 'Active',
      phone: '9876543210',
      dob: new Date('1990-01-01'),
      doj: new Date('2021-01-01'),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Upsert Employee
    await mongoose.connection.collection('users').deleteOne({ email: empEmail });
    await mongoose.connection.collection('users').insertOne({
      name: `Employee (${company.name})`,
      email: empEmail,
      password: hash,
      role: 'EMPLOYEE',
      companyId: company._id,
      department: 'Engineering',
      status: 'Active',
      phone: '9876543211',
      dob: new Date('1995-06-15'),
      doj: new Date('2022-03-01'),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`\n✅ Company: ${company.name}`);
    console.log(`   HR:       ${hrEmail} / password123`);
    console.log(`   Employee: ${empEmail} / password123`);
  }

  // Also print admin account
  const admins = await mongoose.connection.collection('users').find({ role: 'ADMIN' }).toArray();
  console.log('\n=== ALL LOGIN ACCOUNTS ===');
  console.log('Super Admin: superadmin@gmail.com / [original password]');
  admins.forEach(a => console.log(`Admin:       ${a.email} / password123`));

  process.exit();
});
