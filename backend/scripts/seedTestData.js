const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/Project-HRMS').then(async () => {
  const company = await mongoose.connection.collection('companies').findOne({ name: 'Legacy Company Found' });
  if (!company) { console.log("No company found!"); return process.exit(); }
  
  const companyId = company._id;
  console.log("Seeding for company:", company.name, companyId.toString());

  const hash = await bcrypt.hash('password123', 10);
  const departments = ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations'];

  // Seed 1 HR
  await mongoose.connection.collection('users').deleteOne({ email: 'hr1@company.com' });
  const hrUser = await mongoose.connection.collection('users').insertOne({
    name: 'HR Manager', email: 'hr1@company.com', password: hash,
    role: 'HR', companyId: companyId, department: 'HR',
    status: 'Active', phone: '9876543210',
    dob: new Date('1990-05-15'), doj: new Date('2020-01-10'),
    createdAt: new Date(), updatedAt: new Date()
  });

  // Seed 6 Employees
  const empIds = [];
  const empNames = ['Rahul Sharma', 'Priya Mehta', 'Amit Patel', 'Sneha Joshi', 'Rohit Kumar', 'Anjali Singh'];
  for (let i = 0; i < empNames.length; i++) {
    const email = `emp${i+1}@company.com`;
    await mongoose.connection.collection('users').deleteOne({ email });
    const emp = await mongoose.connection.collection('users').insertOne({
      name: empNames[i], email, password: hash,
      role: 'EMPLOYEE', companyId: companyId, department: departments[i % departments.length],
      status: i < 4 ? 'Active' : 'Inactive', phone: `98765432${i}0`,
      dob: new Date(`199${i}-04-${10+i}`), doj: new Date(`202${i % 3}-0${(i % 12)+1}-10`),
      createdAt: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    });
    empIds.push(emp.insertedId);
  }
  console.log("Created", empIds.length, "employees");

  // Seed Attendance (last 7 days)
  await mongoose.connection.collection('attendances').deleteMany({ companyId });
  const statuses = ['Present', 'Present', 'Present', 'Absent', 'Late', 'Present', 'Present'];
  for (const empId of empIds) {
    for (let d = 6; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      date.setHours(0, 0, 0, 0);
      const checkIn = new Date(date); checkIn.setHours(9, d === 2 ? 30 : 0, 0);
      const checkOut = new Date(date); checkOut.setHours(18, 0, 0);
      const statusIdx = Math.floor(Math.random() * statuses.length);
      await mongoose.connection.collection('attendances').insertOne({
        employee: empId, companyId,
        date, checkIn, checkOut,
        status: statuses[statusIdx],
        isLate: statuses[statusIdx] === 'Late',
        workingHours: 9,
        createdAt: new Date()
      });
    }
  }
  console.log("Created attendance records");

  // Seed Leaves
  await mongoose.connection.collection('leaves').deleteMany({ companyId });
  const leaveTypes = ['Sick', 'Casual', 'Paid'];
  const leaveStatuses = ['Pending', 'Approved', 'Rejected', 'Approved', 'Pending', 'Approved'];
  for (let i = 0; i < empIds.length; i++) {
    const from = new Date(); from.setDate(from.getDate() + i + 1);
    const to = new Date(from); to.setDate(to.getDate() + 2);
    await mongoose.connection.collection('leaves').insertOne({
      employee: empIds[i], companyId,
      type: leaveTypes[i % leaveTypes.length],
      from, to, totalDays: 3,
      reason: 'Personal reasons',
      status: leaveStatuses[i],
      createdAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000)
    });
  }
  console.log("Created leave records");

  console.log("\n✅ All test data seeded successfully!");
  console.log("Admin login: admin@company.com / password123");
  console.log("HR login:    hr1@company.com / password123");
  console.log("Employee:    emp1@company.com / password123");
  process.exit();
});
