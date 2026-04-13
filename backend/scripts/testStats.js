const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Project-HRMS').then(async () => {
  try {
    const superAdmin = await mongoose.connection.collection('users').findOne({ role: 'SUPER_ADMIN' });
    if (!superAdmin) {
      console.log('No Super Admin found.');
      return;
    }

    const token = jwt.sign(
      { id: superAdmin._id, role: superAdmin.role, companyId: superAdmin.companyId },
      process.env.JWT_SECRET || 'my-secret123'
    );

    const fetch = (await import('node-fetch')).default; // Use dynamic import if node version requires it, or just use global fetch for Node 18+
    const res = await globalThis.fetch('http://localhost:8000/api/superadmin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Status code:', res.status);
    const data = await res.json();
    console.log('Payload:', data);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
});
