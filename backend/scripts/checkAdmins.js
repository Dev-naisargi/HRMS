const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/Project-HRMS').then(async () => {
  const users = await mongoose.connection.collection('users').find({}).toArray();
  console.log("All Users:");
  users.forEach(u => console.log(u.email, '-', u.role, u.password ? '(Has Password)' : '(No Password)'));
  process.exit();
});
